# Design Document: Tracking Enhancements (Phase 2)

## Overview

Phase 2 extends the existing server-side tracking system across all three
codebases — the Laravel backend module (`modules/ab/tracking/`), the React
frontend package (`@stackra/react-tracking`), and the React Native mobile
package (`@stackra/react-native-tracking`). The enhancements fall into ten
functional areas:

1. **Multi-Instance Pixel Pattern** — replaces hardcoded per-platform pixel
   dispatch in the frontend with a `PixelPlatformInterface` + `PixelManager`
   pattern, making new pixel integrations a single-class addition.
2. **Tracking Constants** — centralizes all hardcoded strings (cookie names,
   headers, endpoints, data attributes) into a single constants file.
3. **Segment CDP Driver** — adds a backend `SegmentPlatform` that sends events
   to Segment's Track API for fan-out to 300+ downstream platforms.
4. **Consent Management** — introduces `ConsentService` in both frontend and
   mobile packages, gating pixel loading, event dispatch, and identity sync
   behind user consent categories (ANALYTICS, MARKETING, FUNCTIONAL).
5. **Backend Consent** — extends the `/api/tracking/context` endpoint and
   `TrackingService` to accept and respect consent state server-side.
6. **Event Delivery Log** — records every platform API call (success or failure)
   in an `event_delivery_log` table for observability.
7. **Dead Letter Queue** — stores permanently failed events in a
   `tracking_dead_letters` table with an Artisan replay command.
8. **Event Schema Validation** — extends `TrackingCompiler` to validate
   `#[PlatformField]` mappings at compile time.
9. **Rate Limiting** — adds configurable per-IP rate limiting to the tracking
   context endpoint.
10. **Platform-Specific Hooks** — PWA lifecycle hooks (install, push, offline),
    desktop app hooks (open, close, idle), A/B test variant passthrough, offline
    conversion upload, and offline event queues for both web and mobile.

### Key Design Decisions

1. **PixelPlatformInterface over monolithic TrackingService** — Each pixel
   platform becomes a self-contained class implementing a common interface. The
   `PixelManager` iterates over configured platforms, so adding a new pixel
   requires zero changes to `TrackingService`. This mirrors the backend's
   `PlatformInterface` + `TrackingManager` pattern.

2. **ConsentService as a DI-managed singleton** — Consent state is managed by a
   dedicated service injected via the DI container, not stored in React state.
   This allows non-React code (services, interceptors) to check consent without
   prop drilling. React components access consent via a `useConsent` hook that
   subscribes to changes.

3. **Consent defaults to `false`** — All consent categories default to denied
   until explicitly granted. This is the strictest GDPR-compliant default. The
   backend maintains backward compatibility: no consent state in session =
   dispatch as normal (pre-consent clients).

4. **OfflineQueueService wraps PixelManager transparently** — The offline queue
   intercepts `fireEvent()` calls at the PixelManager level. When offline,
   events are persisted to IndexedDB/AsyncStorage. When online, they flush in
   FIFO order. No changes needed in TrackingService or hooks.

5. **Dead letter table over Laravel's failed_jobs** — A dedicated
   `tracking_dead_letters` table stores the full event payload, platform name,
   and user context. This allows targeted replay by platform or event type,
   unlike the generic `failed_jobs` table.

6. **Segment uses HTTP Track API, not batch** — Individual event dispatch via
   `https://api.segment.io/v1/track` keeps the implementation consistent with
   existing platform drivers (one job per platform per event). Batch support can
   be added later via the optional `batch_size` config.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PHASE 2 — FRONTEND (React)                              │
│                                                                             │
│  TrackingModule.forRoot(config)                                             │
│    ├── ConsentService (singleton, DI-managed)                               │
│    │     ├── grantConsent() / revokeConsent() / hasConsent()                │
│    │     ├── Syncs consent to backend POST /api/tracking/context            │
│    │     └── Defaults all categories to false                               │
│    │                                                                        │
│    ├── PixelManager (replaces PixelLoaderService)                           │
│    │     ├── Resolves PixelPlatformInterface[] from DI config               │
│    │     ├── loadAll() — calls load() on each (consent-gated)               │
│    │     ├── fireEvent() — iterates platforms (consent-gated)               │
│    │     └── Integrates with OfflineQueueService                            │
│    │                                                                        │
│    ├── PixelPlatformInterface implementations                               │
│    │     ├── MetaPixelPlatform   → fbq('track', ...)                        │
│    │     ├── GtagPlatform        → gtag('event', ...)                       │
│    │     └── TikTokPixelPlatform → ttq.track(...)                           │
│    │                                                                        │
│    ├── OfflineQueueService                                                  │
│    │     ├── Intercepts fireEvent() when navigator.onLine === false          │
│    │     ├── Persists to IndexedDB (preferred) or localStorage (fallback)   │
│    │     ├── Flushes FIFO on 'online' window event                          │
│    │     └── Max 500 events, preserves original timestamps                  │
│    │                                                                        │
│    ├── TrackingService (refactored)                                         │
│    │     ├── Delegates all dispatch to PixelManager                         │
│    │     ├── Retains public API: trackPageView, trackScrollDepth, etc.      │
│    │     └── Removes fireMetaEvent, fireGoogleEvent, fireTikTokEvent        │
│    │                                                                        │
│    ├── PWA Hooks                                                            │
│    │     ├── useAppInstall     → beforeinstallprompt                         │
│    │     ├── usePushOpen       → service worker notification click           │
│    │     └── useOfflinePageView → navigator.onLine === false                 │
│    │                                                                        │
│    ├── Desktop Hooks                                                        │
│    │     ├── useDesktopAppOpen  → window focus from tray                     │
│    │     ├── useDesktopAppClose → close to tray                              │
│    │     └── useSystemIdle      → configurable idle duration                 │
│    │                                                                        │
│    └── useConsent hook → reads/updates ConsentService via DI                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     PHASE 2 — MOBILE (React Native)                         │
│                                                                             │
│  TrackingModule.forRoot(config)                                             │
│    ├── ConsentService (same API as frontend)                                │
│    │     ├── grantConsent() / revokeConsent() / hasConsent()                │
│    │     ├── Syncs consent to backend POST /api/tracking/context            │
│    │     └── Defaults all categories to false                               │
│    │                                                                        │
│    ├── MobileOfflineQueueService                                            │
│    │     ├── Detects connectivity via @react-native-community/netinfo       │
│    │     ├── Persists to AsyncStorage (or MMKV if available)                │
│    │     ├── Flushes FIFO on connectivity restore                           │
│    │     └── Max 500 events, preserves original timestamps                  │
│    │                                                                        │
│    ├── NativeSdkService (consent-gated)                                     │
│    │     ├── Skips initialize() without MARKETING consent                   │
│    │     ├── Skips logEvent() without MARKETING consent                     │
│    │     └── Integrates with MobileOfflineQueueService                      │
│    │                                                                        │
│    ├── MobileIdentitySyncService (consent-gated)                            │
│    │     └── Skips start() without ANALYTICS consent                        │
│    │                                                                        │
│    └── useConsent hook → same API as frontend                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     PHASE 2 — BACKEND (Laravel)                             │
│                                                                             │
│  TrackingModule                                                             │
│    ├── SegmentPlatform (new PlatformInterface driver)                       │
│    │     ├── Transforms Event_DTO → Segment Track API format                │
│    │     ├── HTTP Basic Auth (write key as username)                         │
│    │     ├── Hashes PII (email, phone) with SHA-256                         │
│    │     └── Sends to https://api.segment.io/v1/track                       │
│    │                                                                        │
│    ├── TrackingManager (extended)                                           │
│    │     └── createSegmentDriver() added                                    │
│    │                                                                        │
│    ├── Platform enum (extended)                                             │
│    │     └── SEGMENT = 'segment' case added                                 │
│    │                                                                        │
│    ├── TrackingService (extended)                                           │
│    │     └── Checks session marketing consent before dispatch               │
│    │                                                                        │
│    ├── TrackingContextController (extended)                                 │
│    │     ├── Accepts consent field in request body                          │
│    │     ├── Accepts experiments field in request body                      │
│    │     └── Stores both in session                                         │
│    │                                                                        │
│    ├── StoreTrackingContextData (extended)                                  │
│    │     ├── Optional consent: Record<string, boolean>                      │
│    │     └── Optional experiments: Record<string, string>                   │
│    │                                                                        │
│    ├── SendServerEvent (extended)                                           │
│    │     ├── Writes to event_delivery_log after each platform call          │
│    │     └── failed() writes to tracking_dead_letters                       │
│    │                                                                        │
│    ├── EventDeliveryLog model + migration                                   │
│    │     ├── event_id, platform, event_type, http_status, response_body     │
│    │     ├── match_quality, created_at                                      │
│    │     └── Query scopes: byPlatform, byEventType, byDateRange, failed    │
│    │                                                                        │
│    ├── TrackingDeadLetter model + migration                                 │
│    │     ├── event_id, event_class, event_data, platform, user_context      │
│    │     ├── error_message, failed_at, replayed_at                          │
│    │     └── tracking:replay-dead-letters Artisan command                   │
│    │                                                                        │
│    ├── TrackingCompiler (extended)                                          │
│    │     └── Validates PlatformField mappings, warns on missing/invalid     │
│    │                                                                        │
│    ├── Rate limiting on POST /api/tracking/context                          │
│    │     └── 30 req/min per IP (configurable via config/tracking.php)       │
│    │                                                                        │
│    └── tracking:upload-offline-conversions Artisan command                  │
│          ├── Reads from DB query or CSV file                                │
│          ├── Sends via PlatformInterface drivers                            │
│          ├── Logs to event_delivery_log with 'offline' source               │
│          └── Supports --platform, --dry-run flags                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Consent Flow

```
User grants consent          Frontend/Mobile                  Backend
       │                          │                              │
       │  ConsentService          │                              │
       │  .grantConsent(MARKETING)│                              │
       │─────────────────────────►│                              │
       │                          │  POST /api/tracking/context  │
       │                          │  { consent: {marketing:true}}│
       │                          │─────────────────────────────►│
       │                          │                              │  Store in session
       │                          │                              │
       │                          │  PixelManager.loadAll()      │
       │                          │  (now loads pixel scripts)   │
       │                          │                              │
       │  User navigates          │                              │
       │─────────────────────────►│                              │
       │                          │  PixelManager.fireEvent()    │
       │                          │  (now dispatches to pixels)  │
       │                          │                              │
       │                          │                              │  TrackingService.dispatch()
       │                          │                              │  checks session consent
       │                          │                              │  marketing=true → dispatch
```

## Components and Interfaces

### Frontend Package (`@stackra/react-tracking`) — New & Modified

#### New Files

```
packages/tracking/src/
├── constants/
│   └── tracking.constant.ts          # Cookie names, header, endpoint, data attr
├── enums/
│   └── consent-category.enum.ts      # ANALYTICS, MARKETING, FUNCTIONAL
├── interfaces/
│   ├── pixel-platform.interface.ts   # PixelPlatformInterface
│   ├── consent-state.interface.ts    # ConsentState type
│   └── offline-queue-event.interface.ts # QueuedEvent shape
├── services/
│   ├── pixel-manager.service.ts      # PixelManager — iterates platforms
│   ├── meta-pixel-platform.service.ts    # MetaPixelPlatform
│   ├── gtag-platform.service.ts          # GtagPlatform
│   ├── tiktok-pixel-platform.service.ts  # TikTokPixelPlatform
│   ├── consent.service.ts            # ConsentService
│   └── offline-queue.service.ts      # OfflineQueueService
├── hooks/
│   ├── use-consent.hook.ts           # useConsent
│   ├── use-app-install.hook.ts       # useAppInstall (PWA)
│   ├── use-push-open.hook.ts         # usePushOpen (PWA)
│   ├── use-offline-page-view.hook.ts # useOfflinePageView (PWA)
│   ├── use-desktop-app-open.hook.ts  # useDesktopAppOpen
│   ├── use-desktop-app-close.hook.ts # useDesktopAppClose
│   └── use-system-idle.hook.ts       # useSystemIdle
└── facades/
    ├── consent.facade.ts             # ConsentFacade
    └── pixel-manager.facade.ts       # PixelManagerFacade
```

#### Modified Files

```
├── constants/tokens.constant.ts      # New tokens: PIXEL_MANAGER, CONSENT_SERVICE, etc.
├── interfaces/tracking-config.interface.ts  # Add experiments field
├── services/tracking.service.ts      # Delegate to PixelManager, remove per-platform methods
├── services/pixel-loader.service.ts  # DEPRECATED — replaced by PixelManager
├── tracking.module.ts                # Register new services
└── index.ts                          # Export new symbols
```

#### PixelPlatformInterface

```typescript
export interface PixelPlatformInterface {
  platformName(): string;
  isLoaded(): boolean;
  load(): void;
  fireEvent(
    eventName: string,
    params: Record<string, unknown>,
    eventId?: string,
  ): void;
}
```

#### PixelManager

```typescript
@Injectable()
export class PixelManager {
  public constructor(
    @Inject(PIXEL_PLATFORMS)
    private readonly platforms: PixelPlatformInterface[],
    @Inject(CONSENT_SERVICE) private readonly consent: ConsentService,
    @Inject(OFFLINE_QUEUE) private readonly offlineQueue: OfflineQueueService,
    @Inject(TRACKING_CONFIG) private readonly config: TrackingConfig,
  ) {}

  public loadAll(): void;
  public fireEvent(
    eventName: string,
    params: Record<string, unknown>,
    eventId?: string,
  ): void;
}
```

- `loadAll()` checks `consent.hasConsent(ConsentCategory.MARKETING)` before
  calling `load()` on each platform.
- `fireEvent()` checks marketing consent, then checks online status. If offline,
  delegates to `OfflineQueueService`. If online, iterates platforms and calls
  `fireEvent()`. Appends experiment-variant mapping from config to params.

#### ConsentService

```typescript
@Injectable()
export class ConsentService {
  private state: ConsentState;
  private readonly listeners: Set<() => void>;

  public constructor(
    @Inject(HTTP_CLIENT) private readonly http: HttpClient,
    @Inject(TRACKING_CONFIG) private readonly config: TrackingConfig,
  ) {}

  public grantConsent(category: ConsentCategory): void;
  public revokeConsent(category: ConsentCategory): void;
  public hasConsent(category: ConsentCategory): boolean;
  public updateConsent(state: ConsentState): void;
  public getState(): ConsentState;
  public subscribe(listener: () => void): () => void;
  private syncToBackend(): void;
}
```

- All categories default to `false`.
- `subscribe()` returns an unsubscribe function for the `useConsent` hook.
- `syncToBackend()` POSTs to `{apiBaseUrl}/tracking/context` with the consent
  mapping.

#### OfflineQueueService

```typescript
@Injectable()
export class OfflineQueueService {
  public constructor(
    @Inject(TRACKING_CONFIG) private readonly config: TrackingConfig,
  ) {}

  public isOnline(): boolean;
  public enqueue(event: QueuedEvent): void;
  public flush(dispatcher: (event: QueuedEvent) => void): void;
  public getQueueSize(): number;
  private persist(): Promise<void>;
  private restore(): Promise<QueuedEvent[]>;
}
```

- Uses IndexedDB via a thin wrapper; falls back to localStorage.
- Listens to `window.addEventListener('online', ...)` for auto-flush.
- Max queue size configurable (default 500). Oldest events discarded on
  overflow.
- Each `QueuedEvent` includes `eventName`, `params`, `eventId`, `timestamp`.

#### Tracking Constants

```typescript
// tracking.constant.ts
export const COOKIE_FBP = "_fbp";
export const COOKIE_FBC = "_fbc";
export const COOKIE_GA = "_ga";
export const HEADER_TRACKING_CONTEXT = "X-Tracking-Context";
export const ENDPOINT_TRACKING_CONTEXT = "/tracking/context";
export const DATA_ATTR_CTA = "data-track-cta";
```

### Mobile Package (`@stackra/react-native-tracking`) — New & Modified

#### New Files

```
packages/react-native-tracking/src/
├── enums/
│   └── consent-category.enum.ts        # Same enum as frontend
├── interfaces/
│   ├── consent-state.interface.ts      # Same type as frontend
│   └── offline-queue-event.interface.ts
├── services/
│   ├── consent.service.ts              # Mobile ConsentService
│   └── mobile-offline-queue.service.ts # MobileOfflineQueueService
├── hooks/
│   └── use-consent.hook.ts             # useConsent (mobile)
└── facades/
    └── consent.facade.ts               # ConsentFacade
```

#### Modified Files

```
├── constants/tokens.constant.ts        # New tokens
├── services/tracking.service.ts        # Consent-gated dispatch
├── services/native-sdk.service.ts      # Consent-gated init + offline queue
├── services/identity-sync.service.ts   # Consent-gated sync
├── tracking.module.ts                  # Register new services
└── index.ts                            # Export new symbols
```

#### MobileOfflineQueueService

```typescript
@Injectable()
export class MobileOfflineQueueService {
  public constructor(
    @Inject(TRACKING_CONFIG) private readonly config: MobileTrackingConfig,
  ) {}

  public isOnline(): boolean;
  public enqueue(event: QueuedEvent): void;
  public flush(dispatcher: (event: QueuedEvent) => void): void;
  public getQueueSize(): number;
  private persist(): Promise<void>;
  private restore(): Promise<QueuedEvent[]>;
}
```

- Detects connectivity via `@react-native-community/netinfo` (optional peer
  dependency).
- Persists to AsyncStorage; uses MMKV if available.
- Same FIFO flush, max 500 events, timestamp preservation as web version.

### Backend Module (`modules/ab/tracking/`) — New & Modified

#### New Files

```
modules/ab/tracking/
├── src/
│   ├── Platforms/
│   │   └── SegmentPlatform.php           # Segment Track API driver
│   ├── Models/
│   │   ├── EventDeliveryLog.php          # Eloquent model + scopes
│   │   └── TrackingDeadLetter.php        # Eloquent model
│   └── Commands/
│       ├── ReplayDeadLettersCommand.php  # tracking:replay-dead-letters
│       └── UploadOfflineConversionsCommand.php # tracking:upload-offline-conversions
├── database/
│   └── migrations/
│       ├── xxxx_create_event_delivery_log_table.php
│       └── xxxx_create_tracking_dead_letters_table.php
└── config/
    └── tracking.php                      # Extended with segment, rate_limit
```

#### Modified Files

```
├── src/
│   ├── Enums/Platform.php                # Add SEGMENT case
│   ├── Services/TrackingManager.php      # Add createSegmentDriver()
│   ├── Services/TrackingService.php      # Add consent check before dispatch
│   ├── Jobs/SendServerEvent.php          # Write delivery log + dead letter
│   ├── Compiler/TrackingCompiler.php     # Add PlatformField validation
│   ├── Data/StoreTrackingContextData.php # Add consent + experiments fields
│   └── Controllers/TrackingContextController.php # Store consent + experiments
└── config/tracking.php                   # Add segment, rate_limit entries
```

#### SegmentPlatform

```php
class SegmentPlatform extends AbstractPlatform
{
    public function platformName(): string { return 'segment'; }

    public function send(Data $event, array $userContext): void;
    public function transformPayload(Data $event, array $userContext): array;
}
```

- Transforms Event_DTO into Segment Track API format:
  `{ event, properties, userId, anonymousId, timestamp, context }`.
- Authenticates via HTTP Basic Auth: write key as username, empty password.
- Includes user identity fields in `context.traits`.
- Hashes PII (email, phone) with SHA-256 via inherited
  `hashEmail()`/`hashPhone()`.

#### EventDeliveryLog Model

```php
class EventDeliveryLog extends Model
{
    protected $table = 'event_delivery_log';
    public $timestamps = false;

    // Query scopes
    public function scopeByPlatform(Builder $query, string $platform): Builder;
    public function scopeByEventType(Builder $query, string $eventType): Builder;
    public function scopeByDateRange(Builder $query, Carbon $from, Carbon $to): Builder;
    public function scopeFailed(Builder $query): Builder;
}
```

#### TrackingDeadLetter Model

```php
class TrackingDeadLetter extends Model
{
    protected $table = 'tracking_dead_letters';
    public $timestamps = false;

    protected $casts = [
        'event_data' => 'array',
        'user_context' => 'array',
        'failed_at' => 'datetime',
        'replayed_at' => 'datetime',
    ];
}
```

## Data Models

### event_delivery_log Table

| Column          | Type          | Nullable | Index    | Description                             |
| --------------- | ------------- | -------- | -------- | --------------------------------------- |
| `id`            | `bigint` (PK) | No       | Primary  | Auto-increment primary key              |
| `event_id`      | `string(36)`  | No       | Yes      | UUID v4 event identifier                |
| `platform`      | `string(50)`  | No       | Compound | Platform driver name                    |
| `event_type`    | `string(100)` | No       | —        | Canonical event type (e.g., 'Purchase') |
| `http_status`   | `integer`     | Yes      | —        | HTTP response status code               |
| `response_body` | `text`        | Yes      | —        | Truncated response body (max 2KB)       |
| `match_quality` | `string(50)`  | Yes      | —        | Meta CAPI match quality score           |
| `created_at`    | `timestamp`   | No       | Compound | When the log entry was created          |

Indexes:

- `event_delivery_log_event_id_index` on `event_id`
- `event_delivery_log_platform_created_at_index` on `(platform, created_at)`

### tracking_dead_letters Table

| Column          | Type          | Nullable | Index   | Description                              |
| --------------- | ------------- | -------- | ------- | ---------------------------------------- |
| `id`            | `bigint` (PK) | No       | Primary | Auto-increment primary key               |
| `event_id`      | `string(36)`  | No       | Yes     | UUID v4 event identifier                 |
| `event_class`   | `string(255)` | No       | —       | Fully-qualified Event_DTO class name     |
| `event_data`    | `json`        | No       | —       | Serialized Event_DTO data                |
| `platform`      | `string(50)`  | No       | Yes     | Target platform driver name              |
| `user_context`  | `json`        | No       | —       | User identity and request context        |
| `error_message` | `text`        | No       | —       | Exception message from final failure     |
| `failed_at`     | `timestamp`   | No       | —       | When the job exhausted all retries       |
| `replayed_at`   | `timestamp`   | Yes      | —       | When the entry was replayed (null = not) |

### Extended config/tracking.php

```php
return [
    // ... existing config ...

    'platforms' => [
        // ... existing meta, google, tiktok, null ...

        'segment' => [
            'driver' => 'segment',
            'write_key' => env('SEGMENT_WRITE_KEY'),
            'batch_size' => env('SEGMENT_BATCH_SIZE', 1),
        ],
    ],

    'rate_limit' => [
        'context_endpoint' => (int) env('TRACKING_RATE_LIMIT', 30),
    ],
];
```

### Extended StoreTrackingContextData DTO

```php
class StoreTrackingContextData extends Data
{
    public function __construct(
        // ... existing identity fields ...

        #[Nullable]
        public readonly ?array $consent = null,

        #[Nullable]
        public readonly ?array $experiments = null,
    ) {}
}
```

### Extended TrackingConfig (Frontend)

```typescript
export interface TrackingConfig {
  // ... existing fields ...

  experiments?: Record<string, string>;

  offlineQueue?: {
    maxSize?: number; // default: 500
    storage?: "indexeddb" | "localstorage";
  };
}
```

### ConsentState Type

```typescript
export type ConsentState = Record<ConsentCategory, boolean>;
```

### QueuedEvent Interface

```typescript
export interface QueuedEvent {
  eventName: string;
  params: Record<string, unknown>;
  eventId?: string;
  timestamp: number;
  type: "pixel" | "identity-sync";
}
```

### Segment Track API Payload Format

```json
{
  "event": "Purchase",
  "userId": "hashed-email-sha256",
  "anonymousId": "ga-client-id-or-fbp",
  "timestamp": "2024-01-15T10:30:00Z",
  "properties": {
    "content_ids": ["SKU-123"],
    "value": 99.99,
    "currency": "USD",
    "event_id": "abc-123-uuid"
  },
  "context": {
    "ip": "1.2.3.4",
    "userAgent": "Mozilla/5.0...",
    "traits": {
      "email": "sha256-hash",
      "phone": "sha256-hash"
    },
    "page": {
      "url": "https://example.com/checkout"
    }
  }
}
```
