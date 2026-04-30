# Design Document: Server-Side Tracking

## Overview

This design describes a cross-platform tracking and analytics system spanning
three codebases: a Laravel backend module (`modules/ab/tracking/`), a React
frontend package (`@stackra/react-tracking`), and a React Native mobile package
(`@stackra/react-native-tracking`). The backend is the authoritative source for
all commerce/conversion events, dispatching them to advertising platforms (Meta
CAPI, Google Measurement Protocol, TikTok Events API) via queued jobs. The
frontend and mobile clients handle engagement-only events (page views, screen
views, scroll depth) and synchronize user identity tokens with the backend for
cross-platform deduplication.

The system follows the established Stackra patterns: AOP interceptor attributes
for declarative tracking, compile-time discovery for zero-reflection runtime,
`MultipleInstanceManager` for platform driver resolution, and Spatie Data DTOs
for event payloads with `#[PlatformField]` attributes for per-platform field
mapping. On the frontend, the packages follow the `@stackra` DI module pattern
with `forRoot()`, facades, hooks, and providers.

### Key Design Decisions

1. **`#[PlatformField]` over `#[TrackedAs]`** — Each DTO property declares its
   platform-specific field name per platform via a repeatable attribute. The
   compiler builds per-platform field maps at compile time. Platform classes use
   a generic mapper — zero per-event-type code in platform classes.
2. **`defer()` in interceptor** — The interceptor uses Laravel's `defer()` to
   run dispatch logic after the response is sent. The actual platform API calls
   still go through the queue.
3. **No `Concurrency`** — Job dispatching is Redis pushes (~1ms each).
   Concurrency overhead would exceed the sequential cost. Platform API calls are
   already parallelized by being separate queued jobs.
4. **Health monitoring** — `#[AsHealthCheck]` for the tracking queue, platform
   reachability, and failed job thresholds.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        COMPILE TIME                                     │
│                                                                         │
│  TrackingCompiler (#[AsCompiler] REGISTRY phase)                        │
│    ├── Discovery::attribute(AsServerEvent::class) → Event DTOs          │
│    ├── Discovery::attribute(Track::class) → Tracked methods             │
│    ├── Discovery::attribute(PlatformField::class) → Per-platform maps   │
│    └── Populates TrackingRegistry → bootstrap/cache/tracking_events.php │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        RUNTIME — BACKEND                                │
│                                                                         │
│  Service Method                                                         │
│    │  #[Track(event: PurchaseEvent::class)]                             │
│    ▼                                                                    │
│  TrackingInterceptor (AOP)                                              │
│    │  1. Calls $next() → gets method result                             │
│    │  2. Builds Event_DTO from result via Data::from() or extract map   │
│    │  3. Generates event_id (UUID v4)                                   │
│    │  4. Attaches event_id to X-Tracking-Context header                 │
│    │  5. defer() → TrackingService::dispatch() runs after response      │
│    ▼                                                                    │
│  TrackingService (deferred — runs after response sent)                  │
│    │  1. Looks up platforms + fieldMaps from TrackingRegistry            │
│    │  2. Gathers user context (identity tokens from session)            │
│    │  3. Dispatches SendServerEvent job per platform to 'tracking' queue │
│    ▼                                                                    │
│  SendServerEvent (queued on 'tracking')                                 │
│    │  1. Deserializes Event_DTO via Data::from()                        │
│    │  2. Resolves PlatformInterface via TrackingManager                 │
│    │  3. Calls platform->send(dto, userContext)                         │
│    ▼                                                                    │
│  AbstractPlatform.mapFields() — generic mapper                          │
│    │  Reads compiled fieldMap from registry for this platform           │
│    │  Applies transforms (wrapArray, toItem, toItems)                   │
│    ▼                                                                    │
│  TrackingManager (MultipleInstanceManager)                              │
│    ├── MetaCapiPlatform     → Meta Conversions API                      │
│    ├── GoogleMeasurementPlatform → GA4 Measurement Protocol             │
│    ├── TikTokEventsPlatform → TikTok Events API                        │
│    └── NullPlatform         → Debug logging (local dev)                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        RUNTIME — FRONTEND (React)                       │
│                                                                         │
│  TrackingProvider (React context)                                       │
│    ├── Loads pixel scripts (Meta Pixel, gtag.js, TikTok pixel)          │
│    ├── Reads _fbp, _fbc, _ga cookies → POST /api/tracking/context       │
│    └── Listens for X-Tracking-Context header on API responses           │
│                                                                         │
│  Engagement Events (client-only):                                       │
│    ├── PageView (deduplicated via event_id from header)                 │
│    ├── ScrollDepth (25%, 50%, 75%, 100%)                                │
│    ├── TimeOnPage (reported on visibilitychange)                        │
│    └── CTAClick (data-track-cta attribute)                              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        RUNTIME — MOBILE (React Native)                  │
│                                                                         │
│  TrackingProvider (React context)                                       │
│    ├── Retrieves IDFA/GAID (respecting ATT consent)                     │
│    ├── Sends device ID → POST /api/tracking/context                     │
│    └── Initializes native SDKs (FBSDK, Firebase Analytics)              │
│                                                                         │
│  Engagement Events (client-only):                                       │
│    ├── AppOpen (foreground transition)                                   │
│    ├── ScreenView (navigation changes)                                  │
│    ├── DeepLink (deep link URL opens)                                   │
│    └── PushNotificationOpen (notification tap)                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Deduplication Flow

```
Browser/App                    Laravel Backend                Ad Platform
    │                              │                              │
    │  POST /api/orders            │                              │
    │─────────────────────────────►│                              │
    │                              │  #[Track] intercepts         │
    │                              │  generates event_id=abc-123  │
    │                              │                              │
    │  Response (immediate)        │                              │
    │  X-Tracking-Context: abc-123 │                              │
    │◄─────────────────────────────│                              │
    │                              │                              │
    │                              │  defer() runs after response │
    │                              │  Queue: SendServerEvent      │
    │                              │  (event_id=abc-123)          │
    │                              │──────────────────────────────►│
    │                              │                              │
    │  Client pixel fires          │                              │
    │  fbq('track','Purchase',     │                              │
    │    {event_id:'abc-123'})     │                              │
    │──────────────────────────────┼─────────────────────────────►│
    │                              │                              │
    │                              │  Platform deduplicates       │
    │                              │  by event_id=abc-123         │
```

## Components and Interfaces

### Backend Module (`modules/ab/tracking/`)

#### Module Structure

```
modules/ab/tracking/
├── src/
│   ├── Attributes/
│   │   ├── AsServerEvent.php        ← marks a Data DTO as a tracking event
│   │   ├── Track.php                ← method-level AOP interceptor attribute
│   │   └── PlatformField.php        ← per-platform property field mapping
│   ├── Compiler/
│   │   └── TrackingCompiler.php     ← discovers attributes, builds registry
│   ├── Contracts/
│   │   ├── PlatformInterface.php    ← each platform implements this
│   │   ├── TrackingManagerInterface.php
│   │   └── TrackingRegistryInterface.php
│   ├── Enums/
│   │   └── Platform.php             ← META, GOOGLE, TIKTOK, SNAPCHAT...
│   ├── Interceptors/
│   │   └── TrackingInterceptor.php  ← AOP interceptor, uses defer()
│   ├── Jobs/
│   │   └── SendServerEvent.php      ← queued job per platform
│   ├── Platforms/
│   │   ├── AbstractPlatform.php     ← generic mapFields(), PII hashing
│   │   ├── MetaCapiPlatform.php
│   │   ├── GoogleMeasurementPlatform.php
│   │   ├── TikTokEventsPlatform.php
│   │   └── NullPlatform.php         ← for testing/dev
│   ├── Events/
│   │   ├── PurchaseEvent.php
│   │   ├── ViewContentEvent.php
│   │   ├── AddToCartEvent.php
│   │   ├── SearchEvent.php
│   │   ├── InitiateCheckoutEvent.php
│   │   ├── RegistrationEvent.php
│   │   └── ViewCategoryEvent.php
│   ├── Registry/
│   │   └── TrackingRegistry.php     ← compiled map with per-platform fieldMaps
│   ├── Services/
│   │   ├── TrackingManager.php      ← MultipleInstanceManager
│   │   └── TrackingService.php      ← orchestrates dispatch
│   ├── Health/
│   │   └── TrackingQueueHealthCheck.php ← #[AsHealthCheck]
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── TrackingContextController.php
│   │   ├── Middleware/
│   │   │   └── TrackingContextMiddleware.php ← sets X-Tracking-Context header
│   │   └── Requests/
│   │       └── StoreTrackingContextData.php
│   └── Providers/
│       └── TrackingServiceProvider.php
├── config/
│   └── tracking.php
└── composer.json
```

#### Attributes

| Attribute          | Target   | Repeatable | Purpose                                                              |
| ------------------ | -------- | ---------- | -------------------------------------------------------------------- |
| `#[Track]`         | Method   | Yes        | AOP interceptor — dispatches tracking event after method execution   |
| `#[AsServerEvent]` | Class    | No         | Declares a Spatie Data DTO as a tracking event with platform targets |
| `#[PlatformField]` | Property | Yes        | Maps DTO property to platform-specific field name per platform       |

**Track Attribute** — follows the `#[Emits]` pattern exactly:

```php
#[InterceptedBy(TrackingInterceptor::class)]
#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
final class Track extends InterceptorAttribute
{
    public function __construct(
        public readonly string $event,       // Event_DTO class
        public readonly array $extract = [], // result prop → DTO param map
        int $priority = 200,
        ?string $when = null,
    ) {
        parent::__construct(priority: $priority, when: $when);
    }
}
```

**AsServerEvent Attribute**:

```php
#[Attribute(Attribute::TARGET_CLASS)]
final readonly class AsServerEvent
{
    public function __construct(
        public string $eventType,            // e.g. 'Purchase', 'AddToCart'
        public array $platforms = [],        // e.g. ['meta', 'google', 'tiktok']
    ) {}
}
```

**PlatformField Attribute** — per-platform property mapping:

```php
#[Attribute(Attribute::TARGET_PROPERTY | Attribute::IS_REPEATABLE)]
final readonly class PlatformField
{
    public function __construct(
        public string $platform,             // 'meta', 'google', 'tiktok', or '*' for all
        public string $field,                // the platform-specific field name
        public ?string $transform = null,    // optional: 'wrapArray', 'toItem', 'toItems'
    ) {}
}
```

The `platform` parameter accepts `'*'` as a wildcard meaning "all platforms".
The `transform` parameter triggers structural transformations:

- `wrapArray` — ensures the value is always an array
- `toItem` — wraps a single value into `[['item_id' => $value]]`
- `toItems` — maps an array into `[['item_id' => $v], ...]`

#### Compiler

`TrackingCompiler` implements `CompilerInterface`, annotated with
`#[AsCompiler(priority: 26, phase: CompilerPhase::REGISTRY)]`. It:

1. Discovers `#[AsServerEvent]` classes via `Discovery::attribute()`
2. For each discovered class, reads `#[PlatformField]` attributes on properties
3. Builds per-platform field maps:
   `{ platform → { dtoField → { field, transform } } }`
4. Expands `'*'` wildcard to all platforms declared in `#[AsServerEvent]` or
   config
5. Discovers `#[Track]` methods via `Discovery::attribute()`
6. Builds a map of class::method → event class
7. Writes the compiled map to `bootstrap/cache/tracking_events.php`
8. Populates `TrackingRegistry`

#### Registry

`TrackingRegistry` is a `#[Singleton]` that loads from
`bootstrap/cache/tracking_events.php` on first access. Provides:

- `getEventMeta(string $eventClass): ?array` — returns
  `['platforms' => [...], 'eventType' => '...', 'fieldMaps' => [...]]`
- `getFieldMap(string $eventClass, string $platform): array` — returns the
  compiled field map for a specific platform
- `getEventForMethod(string $class, string $method): ?string` — returns the
  Event_DTO class
- `all(): array` — returns the full compiled map

#### Interceptor

`TrackingInterceptor` implements `InterceptorInterface`. It:

1. Calls `$next()` to execute the original method
2. Reads the `event` and `extract` parameters from the attribute
3. Resolves the source data from the result (unwraps JsonResource → Model)
4. Builds the Event_DTO via `Data::from($source)` or extract map
5. Generates a UUID v4 `event_id`
6. Attaches `event_id` to the response via request attributes
7. Uses `defer()` to run `TrackingService::dispatch()` after the response

```php
public function handle(object $target, string $method, array $args, Closure $next): mixed
{
    $result = $next();

    // ... build $event DTO from result ...

    $eventId = Uuid::uuid4()->toString();
    $this->trackingService->setResponseEventId($eventId, $eventClass);

    // defer() runs after response is sent — zero impact on response time
    defer(fn () => $this->trackingService->dispatch($event, $eventId));

    return $result;
}
```

#### TrackingService

Orchestrates event dispatch:

1. Looks up platform list and fieldMaps from `TrackingRegistry`
2. Falls back to `config('tracking.default')` if no platforms specified
3. Gathers user context from session (fbp, fbc, ga_client_id, idfa, gaid)
4. Dispatches a `SendServerEvent` job per platform to the `tracking` queue

#### TrackingManager

Extends `MultipleInstanceManager`:

```php
class TrackingManager extends MultipleInstanceManager
{
    public function getDefaultInstance(): string;
    public function setDefaultInstance($name): void;
    public function getInstanceConfig($name): ?array;

    protected function createMetaDriver(array $config): PlatformInterface;
    protected function createGoogleDriver(array $config): PlatformInterface;
    protected function createTiktokDriver(array $config): PlatformInterface;
    protected function createNullDriver(array $config): PlatformInterface;

    public function platform(?string $name = null): PlatformInterface;
}
```

#### PlatformInterface

```php
interface PlatformInterface
{
    public function send(Data $event, array $userContext): void;
    public function transformPayload(Data $event, array $userContext): array;
    public function platformName(): string;
}
```

#### AbstractPlatform Base Class

All platform drivers extend `AbstractPlatform` which provides:

```php
abstract class AbstractPlatform implements PlatformInterface
{
    public function __construct(
        protected readonly array $config,
        protected readonly HttpClient $http,
        protected readonly TrackingRegistry $registry,
    ) {}

    /**
     * Generic field mapper — reads compiled field map from registry.
     * No per-event-type code needed.
     */
    protected function mapFields(Data $event): array
    {
        $fieldMap = $this->registry->getFieldMap($event::class, $this->platformName());
        $raw = $event->toArray();
        $mapped = [];

        foreach ($fieldMap as $dtoField => $mapping) {
            if (!array_key_exists($dtoField, $raw) || $raw[$dtoField] === null) {
                continue;
            }
            $value = $raw[$dtoField];
            if ($mapping['transform'] !== null) {
                $value = $this->applyTransform($mapping['transform'], $value);
            }
            $this->setNestedValue($mapped, $mapping['field'], $value);
        }

        return $mapped;
    }

    protected function applyTransform(string $transform, mixed $value): mixed
    {
        return match ($transform) {
            'wrapArray' => is_array($value) ? $value : [$value],
            'toItem' => [['item_id' => (string) $value]],
            'toItems' => array_map(fn ($id) => ['item_id' => (string) $id], (array) $value),
            default => $value,
        };
    }

    // PII hashing
    protected function hashEmail(?string $email): ?string;
    protected function hashPhone(?string $phone): ?string;
    protected function isAlreadyHashed(string $value): bool;
    protected function resolveEventType(Data $event): string;
}
```

Platform classes extend `AbstractPlatform` and only implement the
platform-specific envelope structure. They call `$this->mapFields($event)` for
the field mapping — no per-event-type code.

#### Platform Drivers

| Driver   | Class                       | API Endpoint                                                 |
| -------- | --------------------------- | ------------------------------------------------------------ |
| `meta`   | `MetaCapiPlatform`          | `https://graph.facebook.com/v21.0/{pixel_id}/events`         |
| `google` | `GoogleMeasurementPlatform` | `https://www.google-analytics.com/mp/collect`                |
| `tiktok` | `TikTokEventsPlatform`      | `https://business-api.tiktok.com/open_api/v1.3/event/track/` |
| `null`   | `NullPlatform`              | None (debug logging)                                         |

Each platform driver:

- Extends `AbstractPlatform`
- Uses `mapFields()` for generic field mapping from compiled registry
- Builds platform-specific envelope (user_data, custom_data, items[], etc.)
- Hashes PII (email, phone) with SHA-256 before transmission (Meta, TikTok)
- Normalizes email to lowercase/trimmed, phone to E.164 before hashing
- Skips re-hashing values that are already valid SHA-256 hashes (64 hex chars)
- Reads credentials from `config/tracking.php`

#### SendServerEvent Job

```php
class SendServerEvent implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $queue = 'tracking';
    public int $tries = 3;
    public array $backoff = [10, 60, 300]; // exponential

    public function __construct(
        public readonly string $eventClass,
        public readonly array $eventData,
        public readonly string $platformName,
        public readonly array $userContext,
        public readonly string $eventId,
    ) {}

    public function handle(TrackingManager $manager): void;
    public function failed(\Throwable $exception): void;
}
```

Serializes the Event_DTO via `toArray()` and reconstructs via `Data::from()` in
the `handle()` method.

#### Tracking Context Endpoint

`POST /api/tracking/context` — accepts client identity tokens:

```json
{
  "fbp": "fb.1.1234567890.1234567890",
  "fbc": "fb.1.1234567890.AbCdEfGhIjKlMnOpQrStUvWxYz",
  "ga_client_id": "GA1.1.1234567890.1234567890",
  "idfa": "AEBE52E7-03EE-455A-B3C4-E57283966239",
  "gaid": "38400000-8cf0-11bd-b23e-10b96e40000d"
}
```

Validates at least one field is present. Stores tokens in the user's session.

#### Health Monitoring

`TrackingQueueHealthCheck` annotated with `#[AsHealthCheck]` monitors:

- **Queue processing**: Is the `tracking` queue processing jobs?
- **Failed jobs**: Are `SendServerEvent` jobs failing above a configurable
  threshold?
- **Platform reachability**: Can we reach Meta CAPI / Google MP / TikTok API
  endpoints?

### Frontend Package (`@stackra/react-tracking`)

Located at `react-native-monorepo/packages/tracking/`.

#### Module Structure

```
packages/tracking/
└── src/
    ├── constants/
    │   └── tokens.constant.ts        # TRACKING_SERVICE, TRACKING_CONFIG
    ├── contexts/
    │   └── tracking.context.ts        # TrackingContext
    ├── enums/
    │   └── engagement-event.enum.ts   # EngagementEvent enum
    ├── facades/
    │   └── tracking.facade.ts         # TrackingFacade
    ├── hooks/
    │   ├── use-tracking.hook.ts       # useTracking hook
    │   ├── use-scroll-depth.hook.ts   # useScrollDepth hook
    │   └── use-page-view.hook.ts      # usePageView hook
    ├── interfaces/
    │   ├── tracking-config.interface.ts
    │   └── tracking-service.interface.ts
    ├── providers/
    │   └── tracking.provider.tsx       # TrackingProvider
    ├── services/
    │   ├── tracking.service.ts         # TrackingService
    │   ├── pixel-loader.service.ts     # PixelLoaderService
    │   └── identity-sync.service.ts    # IdentitySyncService
    ├── tracking.module.ts              # TrackingModule with forRoot()
    └── index.ts                        # Barrel export
```

#### Engagement Events

- **PageView**: Fires on route change, passes `event_id` from
  `X-Tracking-Context` for deduplication
- **ScrollDepth**: Fires at configurable thresholds (25%, 50%, 75%, 100%)
- **TimeOnPage**: Reports duration on `visibilitychange` or navigation
- **CTAClick**: Fires on click of elements with `data-track-cta` attribute

### Mobile Package (`@stackra/react-native-tracking`)

Located at `react-native-monorepo/packages/react-native-tracking/`.

#### Module Structure

```
packages/react-native-tracking/
└── src/
    ├── constants/
    │   └── tokens.constant.ts
    ├── contexts/
    │   └── tracking.context.ts
    ├── enums/
    │   └── mobile-event.enum.ts
    ├── facades/
    │   └── tracking.facade.ts
    ├── hooks/
    │   ├── use-tracking.hook.ts
    │   └── use-screen-view.hook.ts
    ├── interfaces/
    │   ├── tracking-config.interface.ts
    │   └── tracking-service.interface.ts
    ├── providers/
    │   └── tracking.provider.tsx
    ├── services/
    │   ├── tracking.service.ts
    │   ├── native-sdk.service.ts
    │   └── identity-sync.service.ts
    ├── tracking.module.ts
    └── index.ts
```

#### Mobile Engagement Events

- **AppOpen**: Fires on `AppState` change from background to active
- **ScreenView**: Fires on React Navigation screen focus
- **DeepLink**: Fires when app opens via deep link URL
- **PushNotificationOpen**: Fires when user taps a push notification

#### Identity Sync

- Retrieves IDFA (iOS) via `react-native-tracking-transparency` +
  `react-native-idfa-aaid`
- Retrieves GAID (Android) via `react-native-idfa-aaid`
- Respects ATT consent — omits IDFA if denied
- Sends to `POST /api/tracking/context`

## Data Models

### Event DTO Examples (with PlatformField)

```php
#[AsServerEvent(eventType: 'Purchase', platforms: ['meta', 'google', 'tiktok'])]
final class PurchaseEvent extends Data
{
    public function __construct(
        #[PlatformField('meta', 'content_ids')]
        #[PlatformField('google', 'items', transform: 'toItems')]
        #[PlatformField('tiktok', 'contents', transform: 'toItems')]
        public readonly array $productIds,

        #[PlatformField('*', 'content_type')]
        public readonly string $contentType,

        #[PlatformField('*', 'value')]
        public readonly float $value,

        #[PlatformField('*', 'currency')]
        public readonly string $currency,

        #[PlatformField('meta', 'num_items')]
        public readonly ?int $numItems = null,

        #[PlatformField('meta', 'order_id')]
        #[PlatformField('google', 'transaction_id')]
        public readonly ?string $transactionId = null,

        public readonly ?string $email = null,
        public readonly ?string $phone = null,
    ) {}
}

#[AsServerEvent(eventType: 'ViewContent')]
final class ViewContentEvent extends Data
{
    public function __construct(
        #[PlatformField('meta', 'content_ids', transform: 'wrapArray')]
        #[PlatformField('google', 'items', transform: 'toItem')]
        public readonly int|string $productId,

        #[PlatformField('*', 'content_type')]
        public readonly string $contentType,

        #[PlatformField('meta', 'content_name')]
        #[PlatformField('google', 'items.item_name')]
        public readonly ?string $contentName = null,

        #[PlatformField('meta', 'content_category')]
        #[PlatformField('google', 'items.item_category')]
        public readonly ?string $categoryName = null,

        #[PlatformField('*', 'value')]
        public readonly ?float $value = null,

        #[PlatformField('*', 'currency')]
        public readonly ?string $currency = null,
    ) {}
}

#[AsServerEvent(eventType: 'AddToCart')]
final class AddToCartEvent extends Data
{
    public function __construct(
        #[PlatformField('meta', 'content_ids')]
        #[PlatformField('google', 'items', transform: 'toItems')]
        public readonly array $productIds,

        #[PlatformField('*', 'content_type')]
        public readonly string $contentType,

        #[PlatformField('*', 'value')]
        public readonly float $value,

        #[PlatformField('*', 'currency')]
        public readonly string $currency,

        #[PlatformField('meta', 'num_items')]
        public readonly ?int $quantity = null,
    ) {}
}

#[AsServerEvent(eventType: 'Search')]
final class SearchEvent extends Data
{
    public function __construct(
        #[PlatformField('meta', 'search_string')]
        #[PlatformField('google', 'search_term')]
        public readonly string $query,

        #[PlatformField('*', 'content_type')]
        public readonly ?string $contentType = null,

        #[PlatformField('google', 'results_count')]
        public readonly ?int $resultCount = null,
    ) {}
}

#[AsServerEvent(eventType: 'InitiateCheckout')]
final class InitiateCheckoutEvent extends Data
{
    public function __construct(
        #[PlatformField('meta', 'content_ids')]
        #[PlatformField('google', 'items', transform: 'toItems')]
        public readonly array $productIds,

        #[PlatformField('*', 'value')]
        public readonly float $value,

        #[PlatformField('*', 'currency')]
        public readonly string $currency,

        #[PlatformField('meta', 'num_items')]
        public readonly int $numItems,
    ) {}
}

#[AsServerEvent(eventType: 'CompleteRegistration')]
final class RegistrationEvent extends Data
{
    public function __construct(
        #[PlatformField('meta', 'content_name')]
        #[PlatformField('google', 'method')]
        public readonly ?string $method = null,

        #[PlatformField('meta', 'status')]
        public readonly string $status = 'complete',
    ) {}
}

#[AsServerEvent(eventType: 'ViewCategory')]
final class ViewCategoryEvent extends Data
{
    public function __construct(
        #[PlatformField('meta', 'content_ids', transform: 'wrapArray')]
        #[PlatformField('google', 'items', transform: 'toItem')]
        public readonly int|string $categoryId,

        #[PlatformField('meta', 'content_category')]
        #[PlatformField('google', 'item_list_name')]
        public readonly string $categoryName,

        #[PlatformField('google', 'results_count')]
        public readonly ?int $productCount = null,
    ) {}
}
```

### Tracking Configuration

```php
// config/tracking.php
return [
    'default' => env('TRACKING_DEFAULT_PLATFORMS', 'meta,google,tiktok'),

    'platforms' => [
        'meta' => [
            'driver' => 'meta',
            'access_token' => env('META_CAPI_ACCESS_TOKEN'),
            'pixel_id' => env('META_PIXEL_ID'),
            'test_event_code' => env('META_TEST_EVENT_CODE'),
        ],
        'google' => [
            'driver' => 'google',
            'measurement_id' => env('GA4_MEASUREMENT_ID'),
            'api_secret' => env('GA4_API_SECRET'),
        ],
        'tiktok' => [
            'driver' => 'tiktok',
            'access_token' => env('TIKTOK_ACCESS_TOKEN'),
            'pixel_code' => env('TIKTOK_PIXEL_CODE'),
        ],
        'null' => [
            'driver' => 'null',
        ],
    ],

    'queue' => [
        'connection' => env('TRACKING_QUEUE_CONNECTION', 'redis'),
        'name' => env('TRACKING_QUEUE_NAME', 'tracking'),
    ],

    'hashing' => [
        'algorithm' => 'sha256',
    ],

    'health' => [
        'failed_job_threshold' => env('TRACKING_FAILED_JOB_THRESHOLD', 10),
    ],
];
```

### TrackingRegistry Cache Format (with PlatformField maps)

```php
// bootstrap/cache/tracking_events.php
return [
    'events' => [
        \Stackra\Tracking\Events\PurchaseEvent::class => [
            'eventType' => 'Purchase',
            'platforms' => ['meta', 'google', 'tiktok'],
            'fieldMaps' => [
                'meta' => [
                    'productIds' => ['field' => 'content_ids', 'transform' => null],
                    'contentType' => ['field' => 'content_type', 'transform' => null],
                    'value' => ['field' => 'value', 'transform' => null],
                    'currency' => ['field' => 'currency', 'transform' => null],
                    'numItems' => ['field' => 'num_items', 'transform' => null],
                    'transactionId' => ['field' => 'order_id', 'transform' => null],
                ],
                'google' => [
                    'productIds' => ['field' => 'items', 'transform' => 'toItems'],
                    'contentType' => ['field' => 'content_type', 'transform' => null],
                    'value' => ['field' => 'value', 'transform' => null],
                    'currency' => ['field' => 'currency', 'transform' => null],
                    'transactionId' => ['field' => 'transaction_id', 'transform' => null],
                ],
                'tiktok' => [
                    'productIds' => ['field' => 'contents', 'transform' => 'toItems'],
                    'contentType' => ['field' => 'content_type', 'transform' => null],
                    'value' => ['field' => 'value', 'transform' => null],
                    'currency' => ['field' => 'currency', 'transform' => null],
                ],
            ],
        ],
        // ... other events follow same pattern
    ],
    'methods' => [
        'App\\Services\\OrderService::complete' => \Stackra\Tracking\Events\PurchaseEvent::class,
        'App\\Services\\CartService::add' => \Stackra\Tracking\Events\AddToCartEvent::class,
        // ...
    ],
];
```

### Frontend Tracking Config Interface

```typescript
interface TrackingConfig {
  meta?: { pixelId: string };
  google?: { measurementId: string };
  tiktok?: { pixelCode: string };
  apiBaseUrl: string;
  scrollDepthThresholds?: number[];
  enableTimeOnPage?: boolean;
  enableCtaTracking?: boolean;
}
```

### Mobile Tracking Config Interface

```typescript
interface MobileTrackingConfig {
  meta?: { appId: string; clientToken: string };
  google?: {};
  apiBaseUrl: string;
  enableAppOpen?: boolean;
  enableScreenView?: boolean;
  enableDeepLink?: boolean;
  enablePushTracking?: boolean;
}
```

## Correctness Properties

### Property 1: Platform fan-out produces one job per platform

_For any_ Event_DTO class with N declared platforms (via `#[AsServerEvent]` or
config defaults), dispatching a tracking event SHALL produce exactly N
`SendServerEvent` jobs, one per platform.

**Validates: Requirements 1.1, 12.1**

### Property 2: Exception suppresses dispatch

_For any_ method annotated with `#[Track]` that throws an exception, the
`TrackingInterceptor` SHALL propagate the exception and dispatch zero tracking
events.

**Validates: Requirements 1.3**

### Property 3: PlatformField compiled mapping

_For any_ Spatie Data DTO with properties annotated with `#[PlatformField]`, the
compiled `TrackingRegistry` SHALL contain a `fieldMaps` entry for each declared
platform, mapping each annotated DTO property to its platform-specific field
name and transform. Wildcard (`'*'`) entries SHALL be expanded to all platforms
declared in the DTO's `#[AsServerEvent]` attribute.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Registry lookups return registered data

_For any_ event class and method binding registered in the `TrackingRegistry`,
`getEventMeta($eventClass)` SHALL return the correct platforms, event type, and
fieldMaps, and `getEventForMethod($class, $method)` SHALL return the correct
Event_DTO class.

**Validates: Requirements 5.3, 5.4**

### Property 5: Platform transformations produce required schema fields

_For any_ valid Event_DTO and user context, each platform's `transformPayload()`
SHALL produce a payload containing all required fields for that platform's API
schema, including the `event_id` field for deduplication. The field mapping
SHALL use the compiled `fieldMaps` from the registry.

- Meta CAPI: `event_name`, `event_time`, `event_id`, `user_data`, `custom_data`
- GA4 MP: `client_id`, `events[].name`, `events[].params`
- TikTok: `event`, `event_id`, `timestamp`, `user`, `properties`

**Validates: Requirements 8.2, 8.4, 9.2, 9.3, 10.2, 24.4**

### Property 6: PII fields are SHA-256 hashed in platform payloads

_For any_ email or phone value in user context, the platform payload SHALL
contain a valid 64-character lowercase hex string (SHA-256 hash) in place of the
original plaintext value.

**Validates: Requirements 8.3, 10.3, 18.1**

### Property 7: PII normalization before hashing

_For any_ email string, the platform SHALL normalize to lowercase and trim
whitespace before hashing. _For any_ phone number, the platform SHALL normalize
to E.164 format before hashing.

**Validates: Requirements 18.2, 18.3**

### Property 8: Pre-hashed values pass through unchanged

_For any_ string that is already a valid SHA-256 hash (exactly 64 lowercase hex
characters), the platform SHALL include it in the payload unchanged.

**Validates: Requirements 18.4**

### Property 9: Event ID appears in both payload and response header

_For any_ tracking event dispatched during an HTTP request, the same `event_id`
(UUID v4) SHALL appear in both the platform API payload and the
`X-Tracking-Context` response header.

**Validates: Requirements 15.1, 15.2, 24.1, 24.2**

### Property 10: Identity endpoint validates at least one field

_For any_ request to `POST /api/tracking/context` containing at least one valid
identity field, the endpoint SHALL return a success response. _For any_ request
with no valid identity fields, the endpoint SHALL return a 422 error.

**Validates: Requirements 16.3, 16.5**

### Property 11: Identity tokens round-trip through session

_For any_ set of identity tokens sent to `POST /api/tracking/context`, the
tokens SHALL be retrievable from the user's session with the same values.

**Validates: Requirements 16.4**

### Property 12: Event DTO construction from source model

_For any_ valid source model with properties matching an Event_DTO's constructor
parameters, `Data::from($model)` SHALL produce a DTO with equivalent values.

**Validates: Requirements 17.4**

### Property 13: Event DTO serialization round-trip

_For any_ valid Event_DTO instance, serializing via `toArray()` and
reconstructing via `Data::from($array)` SHALL produce an equivalent Event_DTO.

**Validates: Requirements 26.1, 12.3**

### Property 14: Driver instance caching

_For any_ valid platform driver name, resolving it twice via `TrackingManager`
within the same request SHALL return the same object instance.

**Validates: Requirements 6.5**

### Property 15: Custom driver resolution

_For any_ class implementing `PlatformInterface` registered in
`config/tracking.php`, the `TrackingManager` SHALL resolve it from the service
container and return a valid `PlatformInterface` instance.

**Validates: Requirements 25.1, 25.2**

### Property 16: GA cookie client_id extraction

_For any_ valid `_ga` cookie value in the format `GA1.X.XXXXXXXXXX.XXXXXXXXXX`,
the extracted `ga_client_id` SHALL be the last two dot-separated segments.

**Validates: Requirements 20.2**

### Property 17: Transform correctness

_For any_ value and transform name, `applyTransform()` SHALL produce the
expected structural output:

- `wrapArray` on scalar → single-element array
- `wrapArray` on array → same array (idempotent)
- `toItem` on scalar → `[['item_id' => (string) $value]]`
- `toItems` on array → `[['item_id' => (string) $v], ...]` for each element

**Validates: Requirements 8.2, 9.2**

## Error Handling

### Backend

| Error Scenario                             | Handling Strategy                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| Tracked method throws exception            | `TrackingInterceptor` propagates exception, no event dispatched         |
| DTO construction fails from result         | Interceptor catches, skips tracking, does not break the request         |
| Unknown platform driver requested          | `TrackingManager` throws `InvalidArgumentException`                     |
| Platform API returns HTTP error            | `SendServerEvent` job retries with exponential backoff (10s, 60s, 300s) |
| Job exceeds max attempts (3)               | Job fails, error logged with platform name, event type, and message     |
| Cache file missing                         | `TrackingRegistry` returns empty results, no exception                  |
| Event DTO deserialization fails in job     | Job fails, logged as deserialization error                              |
| Identity endpoint receives no valid fields | Returns 422 with validation error message                               |
| Platform API timeout                       | HTTP client timeout (configurable), job retries                         |

### Frontend (React)

| Error Scenario                            | Handling Strategy                                                  |
| ----------------------------------------- | ------------------------------------------------------------------ |
| Pixel script fails to load                | Log warning, continue without that pixel — other pixels unaffected |
| Cookie not available (blocked by browser) | Skip identity sync for that cookie, send available ones            |
| `X-Tracking-Context` header missing       | Skip deduplication, fire pixel event without event_id              |
| Identity sync POST fails                  | Log warning, retry on next page navigation                         |
| Scroll depth observer fails               | Log warning, disable scroll tracking for session                   |

### Mobile (React Native)

| Error Scenario                  | Handling Strategy                                             |
| ------------------------------- | ------------------------------------------------------------- |
| ATT permission denied (iOS)     | Omit IDFA from identity sync, continue with other identifiers |
| Native SDK initialization fails | Log error, disable that SDK's tracking, continue with others  |
| IDFA/GAID unavailable           | Skip device ID in identity sync                               |
| Identity sync POST fails        | Log warning, retry on next app foreground                     |
| Deep link URL parsing fails     | Log warning, skip DeepLink event                              |

## Testing Strategy

### Backend Testing (Pest / PHPUnit)

**Unit Tests:**

- Attribute structure tests (Track, AsServerEvent, PlatformField)
- PlatformField wildcard expansion logic
- TrackingRegistry lookup tests with pre-populated data
- AbstractPlatform.mapFields() with various field maps
- AbstractPlatform.applyTransform() for all transform types
- TrackingManager driver resolution with mocked config
- Platform `transformPayload()` output schema validation
- PII hashing logic (normalization, SHA-256, pre-hash detection)
- SendServerEvent job serialization/deserialization
- Identity endpoint validation rules

**Property-Based Tests (Pest with `faker` generators):**

- Property 1: Platform fan-out (generate random platform counts, verify job
  count)
- Property 2: Exception suppresses dispatch (generate random exceptions)
- Property 3: PlatformField compiled mapping (generate DTOs with PlatformField,
  verify registry)
- Property 5: Platform payload schema (generate random Event_DTOs, verify
  required fields)
- Property 6: PII hashing (generate random emails/phones, verify SHA-256 output)
- Property 7: PII normalization (generate emails with mixed case/whitespace)
- Property 8: Pre-hashed passthrough (generate valid SHA-256 hex strings)
- Property 9: Event ID in payload and header (generate random events)
- Property 10: Identity validation (generate random field combinations)
- Property 11: Identity session round-trip (generate random token sets)
- Property 13: DTO serialization round-trip (generate random DTOs)
- Property 14: Driver instance caching (generate random driver names)
- Property 16: GA cookie parsing (generate valid \_ga cookie formats)
- Property 17: Transform correctness (generate random values per transform type)

**Integration Tests:**

- TrackingCompiler with Discovery facade (PlatformField discovery)
- TrackingServiceProvider container bindings
- Full dispatch pipeline (Track → Interceptor → defer → Service → Job)
- Identity endpoint HTTP tests
- Platform API calls with mocked HTTP client

### Frontend Testing (Vitest)

**Unit Tests:**

- TrackingService method signatures
- TrackingModule.forRoot() configuration
- Cookie parsing utilities
- Event deduplication logic

**Integration Tests:**

- TrackingProvider initialization with mocked pixels
- Identity sync flow with mocked API
- Scroll depth observer with mocked DOM
- CTA click tracking with mocked DOM

### Mobile Testing (Jest)

**Unit Tests:**

- TrackingService method signatures
- TrackingModule.forRoot() configuration

**Integration Tests:**

- AppState change → AppOpen event
- Navigation screen change → ScreenView event
- ATT consent flow → IDFA inclusion/omission
- Identity sync with mocked API
