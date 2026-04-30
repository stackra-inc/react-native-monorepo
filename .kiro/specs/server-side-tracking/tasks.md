# Implementation Plan: Server-Side Tracking

## Overview

This plan implements a cross-platform tracking and analytics system spanning
three codebases: a Laravel backend module (`modules/ab/tracking/`), a React
frontend package (`@stackra/react-tracking`), and a React Native mobile package
(`@stackra/react-native-tracking`). Tasks are organized to build the backend
foundation first (attributes, compiler, registry), then the runtime dispatch
pipeline, platform drivers, event DTOs, HTTP layer, and finally the frontend and
mobile packages. Each task builds incrementally on the previous, with no
orphaned code.

## Tasks

- [x] 1. Backend core — attributes, contracts, enums, and config
  - [x] 1.1 Create the `Platform` enum in
        `modules/ab/tracking/src/Enums/Platform.php`
    - Define backed enum cases: `META`, `GOOGLE`, `TIKTOK`, `NULL`
    - Include `value` strings matching driver names (`'meta'`, `'google'`,
      `'tiktok'`, `'null'`)
    - _Requirements: 6.3, 8.1, 9.1, 10.1, 11.1_
  - [x] 1.2 Create the `PlatformInterface` contract in
        `modules/ab/tracking/src/Contracts/PlatformInterface.php`
    - Define `send(Data $event, array $userContext): void`
    - Define `transformPayload(Data $event, array $userContext): array`
    - Define `platformName(): string`
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 1.3 Create the `TrackingRegistryInterface` contract in
        `modules/ab/tracking/src/Contracts/TrackingRegistryInterface.php`
    - Define `getEventMeta(string $eventClass): ?array`
    - Define `getFieldMap(string $eventClass, string $platform): array`
    - Define `getEventForMethod(string $class, string $method): ?string`
    - Define `all(): array`
    - _Requirements: 5.3, 5.4_
  - [x] 1.4 Create the `TrackingManagerInterface` contract in
        `modules/ab/tracking/src/Contracts/TrackingManagerInterface.php`
    - Define `platform(?string $name = null): PlatformInterface`
    - _Requirements: 6.1_
  - [x] 1.5 Create the `AsServerEvent` attribute in
        `modules/ab/tracking/src/Attributes/AsServerEvent.php`
    - Class-level attribute (`Attribute::TARGET_CLASS`)
    - Constructor: `string $eventType`, `array $platforms = []`
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 1.6 Create the `Track` attribute in
        `modules/ab/tracking/src/Attributes/Track.php`
    - Extend `InterceptorAttribute`, add
      `#[InterceptedBy(TrackingInterceptor::class)]`
    - Mark as `Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE`
    - Constructor: `string $event`, `array $extract = []`,
      `int $priority = 200`, `?string $when = null`
    - Follow the `#[Emits]` attribute pattern exactly
    - _Requirements: 1.2, 1.4, 1.5_
  - [x] 1.7 Create the `PlatformField` attribute in
        `modules/ab/tracking/src/Attributes/PlatformField.php`
    - Mark as `Attribute::TARGET_PROPERTY | Attribute::IS_REPEATABLE`
    - Constructor: `string $platform`, `string $field`,
      `?string $transform = null`
    - Support `'*'` wildcard for platform parameter
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 1.8 Create `config/tracking.php` configuration file
    - Define `default`, `platforms` (meta, google, tiktok, null), `queue`,
      `hashing`, `health` sections
    - All credentials sourced from environment variables
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  - [x] 1.9 Create `composer.json` for the tracking module
    - Define package name, autoload PSR-4 namespace `Stackra\\Tracking\\`
    - Declare dependencies on `spatie/laravel-data`,
      `stackra-inc/laravel-framework`
    - _Requirements: 14.1_

- [-] 2. Backend compiler and registry
  - [x] 2.1 Create `TrackingRegistry` in
        `modules/ab/tracking/src/Registry/TrackingRegistry.php`
    - Annotate with `#[Singleton]`, implement `TrackingRegistryInterface`
    - Load from `bootstrap/cache/tracking_events.php` on first access (lazy
      loading)
    - Implement `getEventMeta()`, `getFieldMap()`, `getEventForMethod()`,
      `all()`
    - Return empty results when cache file does not exist (no exception)
    - Provide `register()` method for compiler to populate at compile time
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ] 2.2 Write property test for TrackingRegistry lookups
    - **Property 4: Registry lookups return registered data**
    - **Validates: Requirements 5.3, 5.4**
  - [x] 2.3 Create `TrackingCompiler` in
        `modules/ab/tracking/src/Compiler/TrackingCompiler.php`
    - Implement `CompilerInterface`, annotate with
      `#[AsCompiler(priority: 26, phase: CompilerPhase::REGISTRY)]`
    - Discover `#[AsServerEvent]` classes via `Discovery::attribute()`
    - Read `#[PlatformField]` attributes on DTO properties, build per-platform
      field maps
    - Expand `'*'` wildcard to all platforms declared in `#[AsServerEvent]`
    - Discover `#[Track]` methods via `Discovery::attribute()`
    - Build method → event class map
    - Write compiled map to `bootstrap/cache/tracking_events.php`
    - Populate `TrackingRegistry`
    - Return `CompilerResult` with counts; return skipped result when no
      attributes found
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 3.5, 3.6_
  - [ ] 2.4 Write property test for PlatformField compiled mapping
    - **Property 3: PlatformField compiled mapping**
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Backend interceptor, service, and job — runtime dispatch pipeline
  - [x] 4.1 Create `TrackingInterceptor` in
        `modules/ab/tracking/src/Interceptors/TrackingInterceptor.php`
    - Implement `InterceptorInterface`
    - Use `ReadsInterceptorParameters` concern
    - Call `$next()` first, then build Event_DTO from result
    - Unwrap `JsonResource` → Model if needed
    - Build DTO via `Data::from($source)` or extract map
    - Generate UUID v4 `event_id`
    - Attach `event_id` to request attributes for response header
    - Use `defer()` to run `TrackingService::dispatch()` after response
    - Propagate exceptions without dispatching (if `$next()` throws)
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 15.1, 15.2_
  - [ ] 4.2 Write property test for exception suppresses dispatch
    - **Property 2: Exception suppresses dispatch**
    - **Validates: Requirements 1.3**
  - [x] 4.3 Create `TrackingService` in
        `modules/ab/tracking/src/Services/TrackingService.php`
    - Inject `TrackingRegistry` and `TrackingManager`
    - `dispatch(Data $event, string $eventId)`: look up platforms + fieldMaps
      from registry, fall back to config defaults, gather user context from
      session, dispatch `SendServerEvent` per platform
    - `setResponseEventId(string $eventId, string $eventClass)`: store event_id
      for response header
    - _Requirements: 1.1, 2.4, 12.1_
  - [ ] 4.4 Write property test for platform fan-out
    - **Property 1: Platform fan-out produces one job per platform**
    - **Validates: Requirements 1.1, 12.1**
  - [x] 4.5 Create `SendServerEvent` job in
        `modules/ab/tracking/src/Jobs/SendServerEvent.php`
    - Implement `ShouldQueue`, use `Queueable`, `SerializesModels`
    - Queue: `'tracking'`, tries: 3, backoff: `[10, 60, 300]`
    - Constructor: `string $eventClass`, `array $eventData`,
      `string $platformName`, `array $userContext`, `string $eventId`
    - `handle()`: reconstruct DTO via `Data::from($eventData)`, resolve platform
      via `TrackingManager`, call `platform->send()`
    - `failed()`: log failure with platform name, event type, error message
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  - [ ] 4.6 Write property test for Event DTO serialization round-trip
    - **Property 13: Event DTO serialization round-trip**
    - **Validates: Requirements 26.1, 12.3**

- [x] 5. Backend platform drivers
  - [x] 5.1 Create `AbstractPlatform` in
        `modules/ab/tracking/src/Platforms/AbstractPlatform.php`
    - Constructor: `array $config`, `HttpClient $http`,
      `TrackingRegistry $registry`
    - Implement generic `mapFields(Data $event): array` using compiled field
      maps from registry
    - Implement `applyTransform(string $transform, mixed $value): mixed` for
      `wrapArray`, `toItem`, `toItems`
    - Implement `setNestedValue()` for dot-notation field paths
    - Implement PII hashing: `hashEmail()`, `hashPhone()`, `isAlreadyHashed()`
    - Normalize email (lowercase, trim), phone (E.164) before hashing
    - Skip re-hashing values that are already valid SHA-256 (64 hex chars)
    - Implement `resolveEventType(Data $event): string` from registry
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 3.4_
  - [ ] 5.2 Write property tests for AbstractPlatform
    - **Property 6: PII fields are SHA-256 hashed in platform payloads**
    - **Property 7: PII normalization before hashing**
    - **Property 8: Pre-hashed values pass through unchanged**
    - **Property 17: Transform correctness**
    - **Validates: Requirements 8.3, 10.3, 18.1, 18.2, 18.3, 18.4, 8.2, 9.2**
  - [x] 5.3 Create `MetaCapiPlatform` in
        `modules/ab/tracking/src/Platforms/MetaCapiPlatform.php`
    - Extend `AbstractPlatform`, implement `PlatformInterface`
    - `transformPayload()`: build Meta CAPI envelope with `event_name`,
      `event_time`, `event_id`, `user_data`, `custom_data`
    - Use `mapFields()` for custom_data population
    - Hash email/phone in user_data via inherited methods
    - `send()`: POST to `https://graph.facebook.com/v21.0/{pixel_id}/events`
    - Read access_token, pixel_id, test_event_code from config
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 24.4_
  - [x] 5.4 Create `GoogleMeasurementPlatform` in
        `modules/ab/tracking/src/Platforms/GoogleMeasurementPlatform.php`
    - Extend `AbstractPlatform`, implement `PlatformInterface`
    - `transformPayload()`: build GA4 MP envelope with `client_id`,
      `events[].name`, `events[].params`
    - Use `mapFields()` for event params population
    - Include `client_id` from user context
    - `send()`: POST to `https://www.google-analytics.com/mp/collect`
    - Read measurement_id, api_secret from config
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [x] 5.5 Create `TikTokEventsPlatform` in
        `modules/ab/tracking/src/Platforms/TikTokEventsPlatform.php`
    - Extend `AbstractPlatform`, implement `PlatformInterface`
    - `transformPayload()`: build TikTok Events API envelope with `event`,
      `event_id`, `timestamp`, `user`, `properties`
    - Use `mapFields()` for properties population
    - Hash email/phone in user data via inherited methods
    - `send()`: POST to
      `https://business-api.tiktok.com/open_api/v1.3/event/track/`
    - Read access_token, pixel_code from config
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [x] 5.6 Create `NullPlatform` in
        `modules/ab/tracking/src/Platforms/NullPlatform.php`
    - Extend `AbstractPlatform`, implement `PlatformInterface`
    - `send()`: log event at debug level, no HTTP requests
    - _Requirements: 11.1, 11.2, 11.3_
  - [ ] 5.7 Write property test for platform payload schemas
    - **Property 5: Platform transformations produce required schema fields**
    - **Validates: Requirements 8.2, 8.4, 9.2, 9.3, 10.2, 24.4**

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Backend event DTOs
  - [x] 7.1 Create `PurchaseEvent` in
        `modules/ab/tracking/src/Events/PurchaseEvent.php`
    - Extend `Data`, annotate with
      `#[AsServerEvent(eventType: 'Purchase', platforms: ['meta', 'google', 'tiktok'])]`
    - Properties: `productIds`, `contentType`, `value`, `currency`, `numItems`,
      `transactionId`, `email`, `phone`
    - Apply `#[PlatformField]` attributes per design (including `'*'` wildcards
      and transforms)
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  - [x] 7.2 Create `ViewContentEvent` in
        `modules/ab/tracking/src/Events/ViewContentEvent.php`
    - Extend `Data`, annotate with `#[AsServerEvent(eventType: 'ViewContent')]`
    - Properties: `productId`, `contentType`, `contentName`, `categoryName`,
      `value`, `currency`
    - Apply `#[PlatformField]` attributes per design
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  - [x] 7.3 Create `AddToCartEvent` in
        `modules/ab/tracking/src/Events/AddToCartEvent.php`
    - Extend `Data`, annotate with `#[AsServerEvent(eventType: 'AddToCart')]`
    - Properties: `productIds`, `contentType`, `value`, `currency`, `quantity`
    - Apply `#[PlatformField]` attributes per design
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  - [x] 7.4 Create `SearchEvent` in
        `modules/ab/tracking/src/Events/SearchEvent.php`
    - Extend `Data`, annotate with `#[AsServerEvent(eventType: 'Search')]`
    - Properties: `query`, `contentType`, `resultCount`
    - Apply `#[PlatformField]` attributes per design
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  - [x] 7.5 Create `InitiateCheckoutEvent` in
        `modules/ab/tracking/src/Events/InitiateCheckoutEvent.php`
    - Extend `Data`, annotate with
      `#[AsServerEvent(eventType: 'InitiateCheckout')]`
    - Properties: `productIds`, `value`, `currency`, `numItems`
    - Apply `#[PlatformField]` attributes per design
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  - [x] 7.6 Create `RegistrationEvent` in
        `modules/ab/tracking/src/Events/RegistrationEvent.php`
    - Extend `Data`, annotate with
      `#[AsServerEvent(eventType: 'CompleteRegistration')]`
    - Properties: `method`, `status`
    - Apply `#[PlatformField]` attributes per design
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  - [x] 7.7 Create `ViewCategoryEvent` in
        `modules/ab/tracking/src/Events/ViewCategoryEvent.php`
    - Extend `Data`, annotate with `#[AsServerEvent(eventType: 'ViewCategory')]`
    - Properties: `categoryId`, `categoryName`, `productCount`
    - Apply `#[PlatformField]` attributes per design
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [x] 8. Backend HTTP layer
  - [x] 8.1 Create `StoreTrackingContextData` in
        `modules/ab/tracking/src/Data/StoreTrackingContextData.php`
    - Extend Spatie `Data` with validation attributes
    - Validate: `fbp`, `fbc`, `ga_client_id`, `idfa`, `gaid` — all optional
      strings, but at least one required via `required_without_all`
    - _Requirements: 16.2, 16.3, 16.5_
  - [x] 8.2 Create `TrackingContextController` in
        `modules/ab/tracking/src/Controllers/TrackingContextController.php`
    - Use `#[AsController]`, extend `Stackra\Routing\Controller`
    - Use `#[Post]` route attribute with OpenAPI metadata
    - `store(StoreTrackingContextData $data)`: store validated identity tokens
      in session via `$this->ok()` response
    - _Requirements: 16.1, 16.4_
  - [x] 8.3 Create `TrackingContextMiddleware` in
        `modules/ab/tracking/src/Http/Middleware/TrackingContextMiddleware.php`
    - After response: read event_id from request attributes, set
      `X-Tracking-Context` header
    - _Requirements: 15.1, 15.2_
  - [ ] 8.4 Write property tests for identity endpoint
    - **Property 10: Identity endpoint validates at least one field**
    - **Property 11: Identity tokens round-trip through session**
    - **Validates: Requirements 16.3, 16.4, 16.5**
  - [ ] 8.5 Write property test for event ID in payload and response header
    - **Property 9: Event ID appears in both payload and response header**
    - **Validates: Requirements 15.1, 15.2, 24.1, 24.2**

- [x] 9. Backend service provider, manager, and health check
  - [x] 9.1 Create `TrackingManager` in
        `modules/ab/tracking/src/Services/TrackingManager.php`
    - Extend `MultipleInstanceManager`
    - Implement `getDefaultInstance()`, `setDefaultInstance()`,
      `getInstanceConfig()`
    - Create driver methods: `createMetaDriver()`, `createGoogleDriver()`,
      `createTiktokDriver()`, `createNullDriver()`
    - Inject `AbstractPlatform` dependencies (config, HttpClient,
      TrackingRegistry) into each driver
    - Throw `InvalidArgumentException` for unknown drivers
    - Cache resolved instances for request lifetime
    - Provide `platform(?string $name = null): PlatformInterface` convenience
      method
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ] 9.2 Write property test for driver instance caching
    - **Property 14: Driver instance caching**
    - **Validates: Requirements 6.5**
  - [ ] 9.3 Write property test for custom driver resolution
    - **Property 15: Custom driver resolution**
    - **Validates: Requirements 25.1, 25.2**
  - [x] 9.4 Create `TrackingQueueHealthCheck` in
        `modules/ab/tracking/src/Health/TrackingQueueHealthCheck.php`
    - Uses `#[Config]` and `#[DB]` container attributes for DI
    - Monitor: failed job count vs threshold in 24h window
    - Read threshold from `config('tracking.health.failed_job_threshold')`
    - _Requirements: 14.2_
  - [x] 9.5 Create `TrackingServiceProvider` in
        `modules/ab/tracking/src/Providers/TrackingServiceProvider.php`
    - Extend `Stackra\ServiceProvider\Providers\ServiceProvider`
    - Annotate with `#[Module]` and `#[LoadsResources]`
    - Register `TrackingManager`, `TrackingRegistry`, `TrackingService` bindings
    - Bind `PlatformInterface` to `TrackingManager` resolution
    - Publish `config/tracking.php`
    - Routes handled by `#[Post]` attribute on controller (no manual
      registration)
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 10. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 11. Frontend package (`@stackra/react-tracking`)
  - [x] 11.1 Initialize package structure at `packages/tracking/`
    - Create `package.json` with name `@stackra/react-tracking`
    - Add dependencies: `@stackra/ts-support`, `@stackra/ts-container`,
      `@stackra/ts-http`
    - Create folder structure: `src/constants/`, `src/contexts/`, `src/enums/`,
      `src/facades/`, `src/hooks/`, `src/interfaces/`, `src/providers/`,
      `src/services/`
    - _Requirements: 21.1_
  - [x] 11.2 Create constants and interfaces
    - `src/constants/tokens.constant.ts`: define `TRACKING_SERVICE`,
      `TRACKING_CONFIG` Symbol tokens
    - `src/interfaces/tracking-config.interface.ts`: define `TrackingConfig`
      (meta pixelId, google measurementId, tiktok pixelCode, apiBaseUrl,
      scrollDepthThresholds, enableTimeOnPage, enableCtaTracking)
    - `src/interfaces/tracking-service.interface.ts`: define `TrackingService`
      interface with `trackPageView()`, `trackScrollDepth()`,
      `trackTimeOnPage()`, `trackCtaClick()` methods
    - `src/enums/engagement-event.enum.ts`: define `EngagementEvent` enum
      (PAGE_VIEW, SCROLL_DEPTH, TIME_ON_PAGE, CTA_CLICK)
    - _Requirements: 21.1, 21.2, 21.3_
  - [x] 11.3 Create services
    - `src/services/tracking.service.ts`: implement `TrackingService` —
      orchestrates pixel calls for engagement events, reads event_id from
      response headers for deduplication
    - `src/services/pixel-loader.service.ts`: implement `PixelLoaderService` —
      loads Meta Pixel, gtag.js, TikTok pixel scripts based on config
    - `src/services/identity-sync.service.ts`: implement `IdentitySyncService` —
      reads `_fbp`, `_fbc`, `_ga` cookies, POSTs to `/api/tracking/context`,
      re-syncs on cookie changes
    - _Requirements: 19.5, 20.1, 20.2, 20.3, 21.5_
  - [x] 11.4 Create React context, provider, and hooks
    - `src/contexts/tracking.context.ts`: define `TrackingContext`
    - `src/providers/tracking.provider.tsx`: implement `TrackingProvider` —
      initializes pixel scripts, starts identity sync, listens for
      `X-Tracking-Context` header on API responses
    - `src/hooks/use-tracking.hook.ts`: implement `useTracking` hook — access
      tracking methods from context
    - `src/hooks/use-page-view.hook.ts`: implement `usePageView` hook — fires
      PageView on route change with event_id deduplication
    - `src/hooks/use-scroll-depth.hook.ts`: implement `useScrollDepth` hook —
      fires at configurable thresholds (25%, 50%, 75%, 100%)
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 21.3, 21.4, 24.3_
  - [x] 11.5 Create module and facade
    - `src/tracking.module.ts`: implement `TrackingModule` with
      `forRoot(config: TrackingConfig)` static method following @stackra DI
      module pattern
    - `src/facades/tracking.facade.ts`: implement `TrackingFacade` typed
      constant via `Facade.make<TrackingService>(TRACKING_SERVICE)`
    - _Requirements: 21.1, 21.2_
  - [x] 11.6 Create barrel exports
    - `src/index.ts`: export all public API (module, facade, hooks, provider,
      interfaces, enums, constants)
    - Create barrel `index.ts` in each subfolder
    - _Requirements: 21.1_
  - [ ] 11.7 Write unit tests for frontend tracking package
    - Test TrackingService method signatures and behavior
    - Test TrackingModule.forRoot() configuration
    - Test cookie parsing utilities (GA cookie extraction)
    - Test event deduplication logic
    - _Requirements: 19.1, 20.2, 21.1_
  - [ ] 11.8 Write property test for GA cookie client_id extraction
    - **Property 16: GA cookie client_id extraction**
    - **Validates: Requirements 20.2**

- [x] 12. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 13. Mobile package (`@stackra/react-native-tracking`)
  - [x] 13.1 Initialize package structure at `packages/react-native-tracking/`
    - Create `package.json` with name `@stackra/react-native-tracking`
    - Add dependencies: `@stackra/ts-support`, `@stackra/ts-container`,
      `@stackra/ts-http`
    - Add peer dependencies: `react-native`, `@react-navigation/native`,
      `react-native-fbsdk-next`, `@react-native-firebase/analytics`,
      `react-native-tracking-transparency`, `react-native-idfa-aaid`
    - Create folder structure: `src/constants/`, `src/contexts/`, `src/enums/`,
      `src/facades/`, `src/hooks/`, `src/interfaces/`, `src/providers/`,
      `src/services/`
    - _Requirements: 22.1_
  - [x] 13.2 Create constants and interfaces
    - `src/constants/tokens.constant.ts`: define `TRACKING_SERVICE`,
      `TRACKING_CONFIG` Symbol tokens
    - `src/interfaces/tracking-config.interface.ts`: define
      `MobileTrackingConfig` (meta appId/clientToken, google, apiBaseUrl,
      enableAppOpen, enableScreenView, enableDeepLink, enablePushTracking)
    - `src/interfaces/tracking-service.interface.ts`: define mobile
      `TrackingService` interface with `trackAppOpen()`, `trackScreenView()`,
      `trackDeepLink()`, `trackPushOpen()` methods
    - `src/enums/mobile-event.enum.ts`: define `MobileEvent` enum (APP_OPEN,
      SCREEN_VIEW, DEEP_LINK, PUSH_NOTIFICATION_OPEN)
    - _Requirements: 22.1, 22.2, 22.3, 22.4_
  - [x] 13.3 Create services
    - `src/services/tracking.service.ts`: implement mobile `TrackingService` —
      dispatches engagement events via native SDKs
    - `src/services/native-sdk.service.ts`: implement `NativeSdkService` —
      initializes FBSDK and Firebase Analytics, provides unified dispatch
      interface
    - `src/services/identity-sync.service.ts`: implement `IdentitySyncService` —
      retrieves IDFA/GAID (respecting ATT consent), POSTs to
      `/api/tracking/context`
    - _Requirements: 22.5, 23.1, 23.2, 23.3_
  - [x] 13.4 Create React context, provider, and hooks
    - `src/contexts/tracking.context.ts`: define mobile `TrackingContext`
    - `src/providers/tracking.provider.tsx`: implement `TrackingProvider` —
      initializes native SDKs, starts identity sync, listens for AppState
      changes
    - `src/hooks/use-tracking.hook.ts`: implement `useTracking` hook — access
      mobile tracking methods from context
    - `src/hooks/use-screen-view.hook.ts`: implement `useScreenView` hook —
      fires ScreenView on React Navigation screen focus
    - _Requirements: 22.1, 22.2, 23.4_
  - [x] 13.5 Create module and facade
    - `src/tracking.module.ts`: implement `TrackingModule` with
      `forRoot(config: MobileTrackingConfig)` static method
    - `src/facades/tracking.facade.ts`: implement `TrackingFacade` typed
      constant
    - _Requirements: 22.1_
  - [x] 13.6 Create barrel exports
    - `src/index.ts`: export all public API (module, facade, hooks, provider,
      interfaces, enums, constants)
    - Create barrel `index.ts` in each subfolder
    - _Requirements: 22.1_
  - [ ] 13.7 Write unit tests for mobile tracking package
    - Test TrackingService method signatures and behavior
    - Test TrackingModule.forRoot() configuration
    - Test ATT consent flow → IDFA inclusion/omission logic
    - Test identity sync with mocked API
    - _Requirements: 22.1, 23.1, 23.3_

- [x] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document
- Unit tests validate specific examples and edge cases
- Backend code goes in `php-monorepo/modules/ab/tracking/`
- Frontend code goes in `react-native-monorepo/packages/tracking/`
- Mobile code goes in `react-native-monorepo/packages/react-native-tracking/`
- All PHP code must follow existing module patterns (docblocks, file naming,
  `#[Module]`/`#[LoadsResources]` attributes)
- All TypeScript code must follow @stackra conventions (Str class, facades, DI
  modules, docblocks)
