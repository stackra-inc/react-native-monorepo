# Implementation Plan: Tracking Enhancements (Phase 2)

## Overview

Phase 2 extends the existing server-side tracking system across all three
codebases. All changes are additive — no breaking changes to existing APIs.
Tasks are organized into 10 groups: frontend constants + interface, frontend
pixel platform implementations + manager, frontend TrackingService refactor,
frontend consent management, frontend offline queue + PWA/desktop hooks, mobile
consent + offline queue, backend Segment CDP driver, backend consent + A/B
test + rate limiting, backend event delivery log + dead letter queue, and
backend schema validation + offline conversions. Each task builds incrementally
on the previous, with no orphaned code.

## Tasks

- [x] 1. Frontend: Tracking Constants + PixelPlatformInterface
  - [x] 1.1 Create tracking constants file at
        `frontend-monorepo/packages/tracking/src/constants/tracking.constant.ts`
    - Define `COOKIE_FBP = '_fbp'`, `COOKIE_FBC = '_fbc'`, `COOKIE_GA = '_ga'`
    - Define `HEADER_TRACKING_CONTEXT = 'X-Tracking-Context'`
    - Define `ENDPOINT_TRACKING_CONTEXT = '/tracking/context'`
    - Define `DATA_ATTR_CTA = 'data-track-cta'`
    - Export from `src/constants/index.ts` barrel
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 1.2 Update `IdentitySyncService` to use tracking constants
    - Replace inline `'_fbp'`, `'_fbc'`, `'_ga'` strings with `COOKIE_FBP`,
      `COOKIE_FBC`, `COOKIE_GA` constants
    - Replace inline endpoint path with `ENDPOINT_TRACKING_CONTEXT`
    - _Requirements: 5.5_

  - [x] 1.3 Create `PixelPlatformInterface` at
        `frontend-monorepo/packages/tracking/src/interfaces/pixel-platform.interface.ts`
    - Define `platformName(): string` method
    - Define `isLoaded(): boolean` method
    - Define `load(): void` method
    - Define
      `fireEvent(eventName: string, params: Record<string, unknown>, eventId?: string): void`
      method
    - Export from `src/interfaces/index.ts` barrel
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.4 Add new DI tokens to
        `frontend-monorepo/packages/tracking/src/constants/tokens.constant.ts`
    - Add `PIXEL_MANAGER = Symbol.for('PIXEL_MANAGER')`
    - Add `PIXEL_PLATFORMS = Symbol.for('PIXEL_PLATFORMS')`
    - Add `CONSENT_SERVICE = Symbol.for('CONSENT_SERVICE')`
    - Add `OFFLINE_QUEUE = Symbol.for('OFFLINE_QUEUE')`
    - _Requirements: 1.1, 3.1, 9.1, 28.1_

- [x] 2. Frontend: Pixel Platform Implementations + PixelManager
  - [x] 2.1 Create `MetaPixelPlatform` at
        `frontend-monorepo/packages/tracking/src/services/meta-pixel-platform.service.ts`
    - Implement `PixelPlatformInterface`
    - `load()`: inject Meta Pixel (`fbq`) script tag, call
      `fbq('init', pixelId)`; guard against duplicate injection via `isLoaded()`
      check
    - `fireEvent()`: dispatch via `fbq('track', ...)` for standard events and
      `fbq('trackCustom', ...)` for custom events; pass `eventID` option for
      deduplication
    - `platformName()`: return `'meta'`
    - `isLoaded()`: return whether `window.fbq` is a function
    - Inject `TrackingConfig` via `@Inject(TRACKING_CONFIG)` to read
      `meta.pixelId`
    - No-op silently when Meta is not configured
    - _Requirements: 2.1, 2.4, 2.5_

  - [x] 2.2 Create `GtagPlatform` at
        `frontend-monorepo/packages/tracking/src/services/gtag-platform.service.ts`
    - Implement `PixelPlatformInterface`
    - `load()`: inject `gtag.js` script tag, initialize with `measurementId`;
      guard against duplicate injection
    - `fireEvent()`: dispatch via `gtag('event', eventName, params)` with
      optional `event_id` param
    - `platformName()`: return `'google'`
    - `isLoaded()`: return whether `window.gtag` is a function
    - Inject `TrackingConfig` via `@Inject(TRACKING_CONFIG)` to read
      `google.measurementId`
    - No-op silently when Google is not configured
    - _Requirements: 2.2, 2.4, 2.5_

  - [x] 2.3 Create `TikTokPixelPlatform` at
        `frontend-monorepo/packages/tracking/src/services/tiktok-pixel-platform.service.ts`
    - Implement `PixelPlatformInterface`
    - `load()`: inject TikTok Pixel (`ttq`) script tag, initialize with
      `pixelCode`; guard against duplicate injection
    - `fireEvent()`: dispatch via `ttq.track(eventName, params)` with optional
      `event_id` param
    - `platformName()`: return `'tiktok'`
    - `isLoaded()`: return whether `window.ttq` is an object with a `track`
      function
    - Inject `TrackingConfig` via `@Inject(TRACKING_CONFIG)` to read
      `tiktok.pixelCode`
    - No-op silently when TikTok is not configured
    - _Requirements: 2.3, 2.4, 2.5_

  - [x] 2.4 Create `PixelManager` at
        `frontend-monorepo/packages/tracking/src/services/pixel-manager.service.ts`
    - Inject `PixelPlatformInterface[]` via `@Inject(PIXEL_PLATFORMS)`
    - Inject `ConsentService` via `@Inject(CONSENT_SERVICE)`
    - Inject `OfflineQueueService` via `@Inject(OFFLINE_QUEUE)`
    - Inject `TrackingConfig` via `@Inject(TRACKING_CONFIG)`
    - `loadAll()`: check `consent.hasConsent(ConsentCategory.MARKETING)` before
      calling `load()` on each platform
    - `fireEvent(eventName, params, eventId?)`: check marketing consent; if
      offline, delegate to `OfflineQueueService`; if online, iterate platforms
      and call `fireEvent()`; append experiment-variant mapping from config to
      params when present
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 11.1, 11.2, 11.4, 26.2_

  - [x] 2.5 Create `PixelManagerFacade` at
        `frontend-monorepo/packages/tracking/src/facades/pixel-manager.facade.ts`
    - Define
      `PixelManagerFacade: PixelManager = Facade.make<PixelManager>(PIXEL_MANAGER)`
    - Export from `src/facades/index.ts` barrel
    - _Requirements: 3.1_

- [x] 3. Frontend: Refactor TrackingService
  - [x] 3.1 Refactor `TrackingService` at
        `frontend-monorepo/packages/tracking/src/services/tracking.service.ts`
    - Inject `PixelManager` via `@Inject(PIXEL_MANAGER)` instead of using
      per-platform methods
    - Delegate all pixel dispatch to `PixelManager.fireEvent()`
    - Retain existing public API: `trackPageView()`, `trackScrollDepth()`,
      `trackTimeOnPage()`, `trackCtaClick()`
    - Remove private `fireMetaEvent()`, `fireGoogleEvent()`, `fireTikTokEvent()`
      methods
    - Map engagement event names to platform-appropriate event names within each
      public method before calling `PixelManager.fireEvent()`
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 3.2 Update `TrackingModule.forRoot()` at
        `frontend-monorepo/packages/tracking/src/tracking.module.ts`
    - Register `PixelManager` provider with `PIXEL_MANAGER` token
    - Register `MetaPixelPlatform`, `GtagPlatform`, `TikTokPixelPlatform` as
      `PIXEL_PLATFORMS` array provider
    - Register `ConsentService` with `CONSENT_SERVICE` token
    - Register `OfflineQueueService` with `OFFLINE_QUEUE` token
    - Deprecate `PixelLoaderService` registration (keep for backward compat but
      mark deprecated)
    - _Requirements: 3.1, 4.1_

  - [x] 3.3 Update `TrackingConfig` interface at
        `frontend-monorepo/packages/tracking/src/interfaces/tracking-config.interface.ts`
    - Add optional `experiments?: Record<string, string>` field
    - Add optional
      `offlineQueue?: { maxSize?: number; storage?: 'indexeddb' | 'localstorage' }`
      field
    - _Requirements: 26.1, 28.5_

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Frontend: Consent Management
  - [x] 5.1 Create `ConsentCategory` enum at
        `frontend-monorepo/packages/tracking/src/enums/consent-category.enum.ts`
    - Define `ANALYTICS = 'analytics'`, `MARKETING = 'marketing'`,
      `FUNCTIONAL = 'functional'`
    - Export from `src/enums/index.ts` barrel
    - _Requirements: 8.1_

  - [x] 5.2 Create `ConsentState` type at
        `frontend-monorepo/packages/tracking/src/interfaces/consent-state.interface.ts`
    - Define `ConsentState = Record<ConsentCategory, boolean>`
    - Export from `src/interfaces/index.ts` barrel
    - _Requirements: 8.1, 9.1_

  - [x] 5.3 Create `ConsentService` at
        `frontend-monorepo/packages/tracking/src/services/consent.service.ts`
    - Inject `HttpClient` via `@Inject(HTTP_CLIENT)` and `TrackingConfig` via
      `@Inject(TRACKING_CONFIG)`
    - Store consent state as `ConsentState` with all categories defaulting to
      `false`
    - Implement `grantConsent(category)`, `revokeConsent(category)`,
      `hasConsent(category)`, `updateConsent(state)`, `getState()`
    - Implement `subscribe(listener): () => void` for the `useConsent` hook to
      subscribe to changes
    - On consent state change, sync to backend via
      `POST {apiBaseUrl}${ENDPOINT_TRACKING_CONTEXT}` with the consent mapping
    - Use `ENDPOINT_TRACKING_CONTEXT` constant for the endpoint path
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 5.4 Create `ConsentFacade` at
        `frontend-monorepo/packages/tracking/src/facades/consent.facade.ts`
    - Define
      `ConsentFacade: ConsentService = Facade.make<ConsentService>(CONSENT_SERVICE)`
    - Export from `src/facades/index.ts` barrel
    - _Requirements: 9.1_

  - [x] 5.5 Create `useConsent` hook at
        `frontend-monorepo/packages/tracking/src/hooks/use-consent.hook.ts`
    - Return current `ConsentState` and methods: `grantConsent`,
      `revokeConsent`, `updateConsent`
    - Subscribe to `ConsentService` changes via `subscribe()` and trigger
      re-render on state change
    - Read `ConsentService` from DI container via the tracking context
    - Export from `src/hooks/index.ts` barrel
    - _Requirements: 18.1, 18.2, 18.3_

  - [x] 5.6 Update `IdentitySyncService` to be consent-gated
    - Check `ConsentService.hasConsent(ConsentCategory.ANALYTICS)` before
      syncing identity tokens
    - Skip `start()` and `sync()` when analytics consent is not granted
    - Inject `ConsentService` via `@Inject(CONSENT_SERVICE)`
    - _Requirements: 11.3_

- [x] 6. Frontend: Offline Queue + PWA/Desktop Hooks
  - [x] 6.1 Create `QueuedEvent` interface at
        `frontend-monorepo/packages/tracking/src/interfaces/offline-queue-event.interface.ts`
    - Define `eventName: string`, `params: Record<string, unknown>`,
      `eventId?: string`, `timestamp: number`, `type: 'pixel' | 'identity-sync'`
    - Export from `src/interfaces/index.ts` barrel
    - _Requirements: 28.4_

  - [x] 6.2 Create `OfflineQueueService` at
        `frontend-monorepo/packages/tracking/src/services/offline-queue.service.ts`
    - Inject `TrackingConfig` via `@Inject(TRACKING_CONFIG)`
    - `isOnline()`: return `navigator.onLine` status
    - `enqueue(event: QueuedEvent)`: add event to queue; enforce max size
      (default 500, configurable via `config.offlineQueue.maxSize`); discard
      oldest on overflow; persist to IndexedDB (preferred) or localStorage
      (fallback)
    - `flush(dispatcher)`: flush all queued events in FIFO order via the
      provided dispatcher callback
    - Listen to `window.addEventListener('online', ...)` for auto-flush
    - Persist and restore queue across page reloads via IndexedDB/localStorage
    - Queue identity sync requests when offline alongside pixel events
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7_

  - [x] 6.3 Create `useAppInstall` hook at
        `frontend-monorepo/packages/tracking/src/hooks/use-app-install.hook.ts`
    - Listen for `beforeinstallprompt` browser event
    - Fire `AppInstall` event via `PixelManager.fireEvent()` when user accepts
      the install prompt
    - No-op silently when `beforeinstallprompt` is not supported
    - Export from `src/hooks/index.ts` barrel
    - _Requirements: 24.1, 24.4_

  - [x] 6.4 Create `usePushOpen` hook at
        `frontend-monorepo/packages/tracking/src/hooks/use-push-open.hook.ts`
    - Fire `PushNotificationOpen` event via `PixelManager.fireEvent()` when a
      service worker push notification is clicked
    - No-op silently when Service Worker API is not supported
    - Export from `src/hooks/index.ts` barrel
    - _Requirements: 24.2, 24.4_

  - [x] 6.5 Create `useOfflinePageView` hook at
        `frontend-monorepo/packages/tracking/src/hooks/use-offline-page-view.hook.ts`
    - Fire `OfflinePageView` event via `PixelManager.fireEvent()` when a page is
      served from service worker cache while `navigator.onLine === false`
    - No-op silently when `navigator.onLine` is not supported
    - Export from `src/hooks/index.ts` barrel
    - _Requirements: 24.3, 24.4_

  - [x] 6.6 Create `useDesktopAppOpen` hook at
        `frontend-monorepo/packages/tracking/src/hooks/use-desktop-app-open.hook.ts`
    - Fire `AppOpen` event via `PixelManager.fireEvent()` when the desktop
      window gains focus from the system tray or after being minimized
    - No-op silently when not running in a desktop environment (Electron/Tauri)
    - Export from `src/hooks/index.ts` barrel
    - _Requirements: 25.1, 25.4_

  - [x] 6.7 Create `useDesktopAppClose` hook at
        `frontend-monorepo/packages/tracking/src/hooks/use-desktop-app-close.hook.ts`
    - Fire `AppClose` event via `PixelManager.fireEvent()` when the desktop
      window is closed to the system tray (not terminated)
    - No-op silently when not running in a desktop environment
    - Export from `src/hooks/index.ts` barrel
    - _Requirements: 25.2, 25.4_

  - [x] 6.8 Create `useSystemIdle` hook at
        `frontend-monorepo/packages/tracking/src/hooks/use-system-idle.hook.ts`
    - Fire `SystemIdle` event via `PixelManager.fireEvent()` when the user has
      been inactive for a configurable duration
    - No-op silently when not running in a desktop environment
    - Export from `src/hooks/index.ts` barrel
    - _Requirements: 25.3, 25.4_

  - [x] 6.9 Update `src/index.ts` barrel exports
    - Export all new constants, enums, interfaces, services, hooks, and facades
    - _Requirements: 1.1, 3.1, 5.1, 8.1, 9.1, 18.1, 24.1, 25.1, 28.1_

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Mobile: Consent + Offline Queue
  - [x] 8.1 Create `ConsentCategory` enum at
        `react-native-monorepo/packages/react-native-tracking/src/enums/consent-category.enum.ts`
    - Define `ANALYTICS = 'analytics'`, `MARKETING = 'marketing'`,
      `FUNCTIONAL = 'functional'` (identical to frontend)
    - Export from `src/enums/index.ts` barrel
    - _Requirements: 8.2_

  - [x] 8.2 Create `ConsentState` type at
        `react-native-monorepo/packages/react-native-tracking/src/interfaces/consent-state.interface.ts`
    - Define `ConsentState = Record<ConsentCategory, boolean>`
    - Export from `src/interfaces/index.ts` barrel
    - _Requirements: 8.2, 10.1_

  - [x] 8.3 Add new DI tokens to
        `react-native-monorepo/packages/react-native-tracking/src/constants/tokens.constant.ts`
    - Add `CONSENT_SERVICE = Symbol.for('MOBILE_CONSENT_SERVICE')`
    - Add `OFFLINE_QUEUE = Symbol.for('MOBILE_OFFLINE_QUEUE')`
    - _Requirements: 10.1, 29.1_

  - [x] 8.4 Create mobile `ConsentService` at
        `react-native-monorepo/packages/react-native-tracking/src/services/consent.service.ts`
    - Same public API as frontend: `grantConsent`, `revokeConsent`,
      `hasConsent`, `updateConsent`, `getState`, `subscribe`
    - Default all categories to `false`
    - Sync consent state to backend via `POST /api/tracking/context` on change
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 8.5 Create `ConsentFacade` at
        `react-native-monorepo/packages/react-native-tracking/src/facades/consent.facade.ts`
    - Define
      `ConsentFacade: ConsentService = Facade.make<ConsentService>(CONSENT_SERVICE)`
    - Export from `src/facades/index.ts` barrel
    - _Requirements: 10.1_

  - [x] 8.6 Create `QueuedEvent` interface at
        `react-native-monorepo/packages/react-native-tracking/src/interfaces/offline-queue-event.interface.ts`
    - Define `eventName`, `params`, `eventId?`, `timestamp`, `type`
    - Export from `src/interfaces/index.ts` barrel
    - _Requirements: 29.5_

  - [x] 8.7 Create `MobileOfflineQueueService` at
        `react-native-monorepo/packages/react-native-tracking/src/services/mobile-offline-queue.service.ts`
    - Detect connectivity via `@react-native-community/netinfo` (optional peer
      dependency)
    - Persist queued events to AsyncStorage (or MMKV if available)
    - Flush FIFO on connectivity restore
    - Max 500 events (configurable), preserve original timestamps
    - Discard oldest events on overflow
    - Queue identity sync requests when offline
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8_

  - [x] 8.8 Update mobile `NativeSdkService` to be consent-gated
    - Inject `ConsentService` via `@Inject(CONSENT_SERVICE)`
    - Skip `initialize()` when `MARKETING` consent is not granted
    - Skip `logEvent()` when `MARKETING` consent is not granted
    - Integrate with `MobileOfflineQueueService` — route `logEvent()` calls
      through offline queue when device is offline
    - _Requirements: 12.1, 12.2, 29.7_

  - [x] 8.9 Update mobile `IdentitySyncService` to be consent-gated
    - Inject `ConsentService` via `@Inject(CONSENT_SERVICE)`
    - Skip `start()` when `ANALYTICS` consent is not granted
    - _Requirements: 12.3_

  - [x] 8.10 Create mobile `useConsent` hook at
        `react-native-monorepo/packages/react-native-tracking/src/hooks/use-consent.hook.ts`
    - Same API as frontend `useConsent` hook
    - Return current `ConsentState` and methods: `grantConsent`,
      `revokeConsent`, `updateConsent`
    - Trigger re-render on consent state change
    - Export from `src/hooks/index.ts` barrel
    - _Requirements: 19.1, 19.2_

  - [x] 8.11 Update mobile `TrackingModule.forRoot()` at
        `react-native-monorepo/packages/react-native-tracking/src/tracking.module.ts`
    - Register `ConsentService` with `CONSENT_SERVICE` token
    - Register `MobileOfflineQueueService` with `OFFLINE_QUEUE` token
    - _Requirements: 10.1, 29.1_

  - [x] 8.12 Add `@react-native-community/netinfo` as optional peer dependency
        in `react-native-monorepo/packages/react-native-tracking/package.json`
    - _Requirements: 29.9_

  - [x] 8.13 Update `src/index.ts` barrel exports
    - Export all new enums, interfaces, services, hooks, and facades
    - _Requirements: 8.2, 10.1, 19.1, 29.1_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
