# Requirements Document: Tracking Enhancements (Phase 2)

## Introduction

Phase 2 of the server-side tracking system. Builds on the existing tracking
infrastructure across three codebases — the Laravel backend module
(`modules/ab/tracking/`), the React frontend package
(`@stackra/react-tracking`), and the React Native mobile package
(`@stackra/react-native-tracking`). This phase adds six capabilities: a
multi-instance pixel pattern to eliminate per-platform code in the frontend,
constants for hardcoded strings, a Segment/RudderStack CDP driver for the
backend, consent management across frontend and mobile, consent-aware backend
dispatch, and an event delivery log for observability.

## Glossary

- **Tracking_Module**: The Laravel module at `modules/ab/tracking/` that
  provides server-side event dispatch, platform driver management, compile-time
  discovery, and client identity endpoints.
- **React_Tracking_Package**: The `@stackra/react-tracking` package in the
  frontend monorepo that handles browser engagement events and client-side pixel
  management.
- **ReactNative_Tracking_Package**: The `@stackra/react-native-tracking` package
  in the react-native-monorepo that handles mobile engagement events via native
  SDKs.
- **PixelPlatformInterface**: A TypeScript interface that each client-side pixel
  platform (Meta, Google, TikTok) implements, defining `load()`, `fireEvent()`,
  and `platformName()` methods.
- **PixelManager**: A service in the React_Tracking_Package that resolves
  configured `PixelPlatformInterface` implementations and iterates over them to
  fire events — replacing the hardcoded per-platform methods in
  `TrackingService`.
- **MetaPixelPlatform**: A `PixelPlatformInterface` implementation that wraps
  the Meta Pixel (`fbq`) script loading and event dispatch.
- **GtagPlatform**: A `PixelPlatformInterface` implementation that wraps the
  Google Analytics (`gtag.js`) script loading and event dispatch.
- **TikTokPixelPlatform**: A `PixelPlatformInterface` implementation that wraps
  the TikTok Pixel (`ttq`) script loading and event dispatch.
- **TrackingConstants**: A centralized set of constant values for cookie names,
  header names, endpoint paths, and data attributes used across the
  React_Tracking_Package.
- **SegmentPlatform**: A `PlatformInterface` driver in the Tracking_Module that
  sends events to Segment's Track API, enabling fan-out to 300+ downstream
  platforms.
- **ConsentService**: A service in both the React_Tracking_Package and
  ReactNative_Tracking_Package that manages user consent state per category
  (analytics, marketing, functional) and gates all tracking calls based on
  consent status.
- **ConsentCategory**: An enum defining the consent categories: `ANALYTICS`,
  `MARKETING`, and `FUNCTIONAL`.
- **ConsentState**: A record mapping each `ConsentCategory` to a boolean
  indicating whether the user has granted consent for that category.
- **EventDeliveryLog**: A database table (`event_delivery_log`) that records
  every event sent to a platform, including platform name, event type, event_id,
  HTTP status code, timestamp, and optional match quality metadata.
- **SendServerEvent_Job**: The existing queued Laravel job dispatched
  per-platform to deliver event payloads to the advertising platform API
  (extended in Phase 2 to write delivery log entries).
- **PlatformInterface**: The existing contract each advertising platform driver
  implements, defining how to transform and send event payloads.
- **TrackingManager**: The existing `MultipleInstanceManager`-based service that
  resolves platform driver instances by name.
- **TrackingService**: The existing backend service that orchestrates event
  dispatch (extended in Phase 2 to check consent before dispatching).

## Requirements

### Requirement 1: PixelPlatformInterface Contract

**User Story:** As a frontend developer, I want a common interface for
client-side pixel platforms so that adding a new pixel requires only one new
class and one config entry, with zero changes to the TrackingService.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL define a `PixelPlatformInterface` with a
   `load()` method that injects the platform's script tag into the DOM.
2. THE PixelPlatformInterface SHALL define a
   `fireEvent(eventName: string, params: Record<string, unknown>, eventId?: string)`
   method that dispatches an event to the platform's pixel.
3. THE PixelPlatformInterface SHALL define a `platformName()` method returning
   the platform's string identifier (e.g., `'meta'`, `'google'`, `'tiktok'`).
4. THE PixelPlatformInterface SHALL define an `isLoaded()` method returning
   whether the platform's script has been loaded into the DOM.

### Requirement 2: Pixel Platform Implementations

**User Story:** As a frontend developer, I want each advertising pixel wrapped
in a `PixelPlatformInterface` implementation so that the TrackingService
dispatches events generically without per-platform code.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL provide a `MetaPixelPlatform` class
   implementing `PixelPlatformInterface` that loads the Meta Pixel (`fbq`)
   script and dispatches events via `fbq('track', ...)` and
   `fbq('trackCustom', ...)`.
2. THE React_Tracking_Package SHALL provide a `GtagPlatform` class implementing
   `PixelPlatformInterface` that loads the `gtag.js` script and dispatches
   events via `gtag('event', ...)`.
3. THE React_Tracking_Package SHALL provide a `TikTokPixelPlatform` class
   implementing `PixelPlatformInterface` that loads the TikTok Pixel (`ttq`)
   script and dispatches events via `ttq.track(...)`.
4. EACH pixel platform implementation SHALL load its script at most once per
   page lifecycle, preventing duplicate script injection.
5. EACH pixel platform implementation SHALL no-op silently when the platform is
   not configured or the script has not loaded.

### Requirement 3: PixelManager Service

**User Story:** As a frontend developer, I want a PixelManager that resolves
configured pixel platforms and iterates over them so that the TrackingService
contains zero per-platform dispatch code.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL provide a `PixelManager` service that
   accepts an array of `PixelPlatformInterface` implementations via DI
   configuration.
2. THE PixelManager SHALL provide a `loadAll()` method that calls `load()` on
   each configured pixel platform.
3. THE PixelManager SHALL provide a
   `fireEvent(eventName: string, params: Record<string, unknown>, eventId?: string)`
   method that iterates over all configured platforms and calls `fireEvent()` on
   each.
4. WHEN a new pixel platform is added, THE PixelManager SHALL dispatch events to
   the new platform without any changes to the TrackingService.

### Requirement 4: Refactored TrackingService Using PixelManager

**User Story:** As a frontend developer, I want the TrackingService to delegate
all pixel dispatch to the PixelManager so that per-platform methods
(`fireMetaEvent`, `fireGoogleEvent`, `fireTikTokEvent`) are removed.

#### Acceptance Criteria

1. THE TrackingService SHALL delegate all pixel event dispatch to the
   PixelManager instead of calling per-platform methods directly.
2. THE TrackingService SHALL retain its existing public API (`trackPageView()`,
   `trackScrollDepth()`, `trackTimeOnPage()`, `trackCtaClick()`) without
   breaking changes.
3. THE TrackingService SHALL remove the private `fireMetaEvent()`,
   `fireGoogleEvent()`, and `fireTikTokEvent()` methods.

### Requirement 5: Tracking Constants

**User Story:** As a frontend developer, I want all hardcoded strings (cookie
names, header names, endpoint paths, data attributes) centralized in a constants
file so that they are defined once and referenced everywhere.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL define constants for cookie names: `_fbp`,
   `_fbc`, and `_ga`.
2. THE React_Tracking_Package SHALL define a constant for the tracking context
   response header name `X-Tracking-Context`.
3. THE React_Tracking_Package SHALL define a constant for the tracking context
   endpoint path `/tracking/context`.
4. THE React_Tracking_Package SHALL define a constant for the CTA tracking data
   attribute `data-track-cta`.
5. ALL services in the React_Tracking_Package that reference these values SHALL
   use the defined constants instead of inline string literals.

### Requirement 6: Segment CDP Platform Driver

**User Story:** As a backend developer, I want a Segment platform driver so that
events can be sent to Segment's Track API and fanned out to 300+ downstream
platforms without adding individual drivers.

#### Acceptance Criteria

1. THE Tracking_Module SHALL provide a `SegmentPlatform` class implementing
   `PlatformInterface`.
2. THE SegmentPlatform SHALL transform Event_DTO payloads into Segment's Track
   API format, including `event`, `properties`, `userId`, `anonymousId`,
   `timestamp`, and `context` fields.
3. THE SegmentPlatform SHALL send events to Segment's HTTP Track API endpoint
   (`https://api.segment.io/v1/track`).
4. THE SegmentPlatform SHALL authenticate requests using the Segment write key
   via HTTP Basic Auth (write key as username, empty password).
5. THE SegmentPlatform SHALL read its write key from `config/tracking.php` under
   the `segment` platform entry.
6. THE SegmentPlatform SHALL include user identity fields (email, phone,
   ga_client_id, fbp, fbc) in the Segment `traits` or `context` as appropriate.
7. THE SegmentPlatform SHALL hash PII fields (email, phone) using SHA-256 before
   including them in the payload, consistent with existing platform drivers.
8. THE TrackingManager SHALL support resolving the `segment` driver alongside
   existing drivers (`meta`, `google`, `tiktok`, `null`).

### Requirement 7: Segment Platform Configuration

**User Story:** As a backend developer, I want the Segment platform configurable
via `config/tracking.php` so that it can be enabled per environment.

#### Acceptance Criteria

1. THE `config/tracking.php` file SHALL include a `segment` entry in the
   `platforms` section with `driver`, `write_key`, and optional `batch_size`
   fields.
2. THE `segment` platform credentials SHALL be sourced from environment
   variables (`SEGMENT_WRITE_KEY`).
3. WHEN the `segment` platform is included in the `default` platforms list, THE
   Tracking_Module SHALL dispatch events to Segment alongside other configured
   platforms.

### Requirement 8: ConsentCategory Enum

**User Story:** As a frontend developer, I want a consent category enum so that
consent state is type-safe and consistent across the tracking packages.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL define a `ConsentCategory` enum with values
   `ANALYTICS`, `MARKETING`, and `FUNCTIONAL`.
2. THE ReactNative_Tracking_Package SHALL define the same `ConsentCategory` enum
   with identical values.

### Requirement 9: ConsentService — Frontend

**User Story:** As a frontend developer, I want a ConsentService that manages
user consent state so that tracking pixels only fire when the user has granted
consent for the corresponding category.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL provide a `ConsentService` that stores
   consent state as a mapping of `ConsentCategory` to boolean.
2. THE ConsentService SHALL provide a `grantConsent(category: ConsentCategory)`
   method that sets consent to `true` for the specified category.
3. THE ConsentService SHALL provide a `revokeConsent(category: ConsentCategory)`
   method that sets consent to `false` for the specified category.
4. THE ConsentService SHALL provide a `hasConsent(category: ConsentCategory)`
   method returning whether consent is granted for the specified category.
5. THE ConsentService SHALL provide an `updateConsent(state: ConsentState)`
   method that replaces the entire consent state at once.
6. WHEN consent state changes, THE ConsentService SHALL sync the updated state
   to the backend via the `POST /api/tracking/context` endpoint.
7. THE ConsentService SHALL default all categories to `false` (no consent) until
   explicitly granted.

### Requirement 10: ConsentService — Mobile

**User Story:** As a mobile developer, I want a ConsentService in the React
Native tracking package so that native SDK events only fire when the user has
granted consent for the corresponding category.

#### Acceptance Criteria

1. THE ReactNative_Tracking_Package SHALL provide a `ConsentService` with the
   same public API as the frontend ConsentService (`grantConsent`,
   `revokeConsent`, `hasConsent`, `updateConsent`).
2. THE mobile ConsentService SHALL default all categories to `false` (no
   consent) until explicitly granted.
3. WHEN consent state changes, THE mobile ConsentService SHALL sync the updated
   state to the backend via the `POST /api/tracking/context` endpoint.

### Requirement 11: Consent-Gated Pixel Dispatch — Frontend

**User Story:** As a privacy officer, I want tracking pixels to only fire when
the user has granted consent for the marketing category so that the system
complies with GDPR and CCPA requirements.

#### Acceptance Criteria

1. WHEN the user has not granted `MARKETING` consent, THE PixelManager SHALL
   skip calling `fireEvent()` on all pixel platforms.
2. WHEN the user has not granted `MARKETING` consent, THE PixelManager SHALL
   skip calling `load()` on pixel platforms (no scripts injected).
3. WHEN the user has not granted `ANALYTICS` consent, THE IdentitySyncService
   SHALL skip sending identity tokens to the backend.
4. WHEN consent is granted after initial page load, THE PixelManager SHALL load
   and initialize pixel scripts at that point.

### Requirement 12: Consent-Gated Native SDK Dispatch — Mobile

**User Story:** As a privacy officer, I want native SDK events to only fire when
the user has granted consent for the marketing category so that the mobile app
complies with privacy regulations.

#### Acceptance Criteria

1. WHEN the user has not granted `MARKETING` consent, THE
   ReactNative_Tracking_Package SHALL skip dispatching events via native SDKs.
2. WHEN the user has not granted `MARKETING` consent, THE
   ReactNative_Tracking_Package SHALL skip initializing native SDKs.
3. WHEN the user has not granted `ANALYTICS` consent, THE
   MobileIdentitySyncService SHALL skip sending device identifiers to the
   backend.

### Requirement 13: Consent Field on Backend Context Endpoint

**User Story:** As a backend developer, I want the `/api/tracking/context`
endpoint to accept consent state so that the backend can respect user consent
when dispatching server-side events.

#### Acceptance Criteria

1. THE `StoreTrackingContextData` DTO SHALL accept an optional `consent` field
   containing a mapping of consent category names to boolean values.
2. THE TrackingContextController SHALL store the received consent state in the
   user's session alongside identity tokens.
3. THE `consent` field SHALL accept the keys `analytics`, `marketing`, and
   `functional`, each mapping to a boolean value.
4. WHEN no `consent` field is provided, THE endpoint SHALL not modify any
   existing consent state in the session.
5. THE existing validation rule requiring at least one identity field SHALL be
   updated to also accept a request containing only the `consent` field.

### Requirement 14: Consent-Aware Backend Dispatch

**User Story:** As a privacy officer, I want the backend to check consent state
before dispatching server-side events so that PII is not sent to advertising
platforms when the user has denied marketing consent.

#### Acceptance Criteria

1. WHEN the user's session contains `marketing` consent set to `false`, THE
   TrackingService SHALL skip dispatching events to advertising platforms (Meta,
   Google, TikTok, Segment).
2. WHEN the user's session contains no consent state, THE TrackingService SHALL
   dispatch events as normal (backward compatibility with pre-consent clients).
3. WHEN the user's session contains `marketing` consent set to `true`, THE
   TrackingService SHALL dispatch events as normal.

### Requirement 15: Event Delivery Log Table

**User Story:** As a backend developer, I want an `event_delivery_log` table so
that every event sent to a platform is recorded for observability and debugging.

#### Acceptance Criteria

1. THE Tracking_Module SHALL provide a migration creating an
   `event_delivery_log` table.
2. THE table SHALL include columns: `id` (primary key), `event_id` (UUID
   string), `platform` (string), `event_type` (string), `http_status` (integer,
   nullable), `response_body` (text, nullable), `match_quality` (string,
   nullable), `created_at` (timestamp).
3. THE table SHALL index the `event_id` column for efficient lookups.
4. THE table SHALL index the `platform` and `created_at` columns for time-range
   queries per platform.

### Requirement 16: Event Delivery Log Writing

**User Story:** As a backend developer, I want the SendServerEvent job to write
a delivery log entry after each platform call so that successful and failed
deliveries are recorded.

#### Acceptance Criteria

1. WHEN a SendServerEvent_Job successfully sends an event to a platform, THE job
   SHALL insert a row into the `event_delivery_log` table with the HTTP status
   code and platform response metadata.
2. WHEN a SendServerEvent_Job fails to send an event (HTTP error or exception),
   THE job SHALL insert a row into the `event_delivery_log` table with the error
   status and response body.
3. THE delivery log entry SHALL include the `event_id`, `platform` name,
   `event_type`, `http_status`, and `created_at` timestamp.
4. FOR Meta CAPI responses that include match quality data, THE delivery log
   entry SHALL store the match quality in the `match_quality` column.

### Requirement 17: Event Delivery Log Model

**User Story:** As a backend developer, I want an Eloquent model for the
delivery log so that log entries can be queried programmatically.

#### Acceptance Criteria

1. THE Tracking_Module SHALL provide an `EventDeliveryLog` Eloquent model mapped
   to the `event_delivery_log` table.
2. THE model SHALL provide query scopes for filtering by platform, event type,
   and date range.
3. THE model SHALL provide a scope for filtering failed deliveries (HTTP status
   > = 400 or null).

### Requirement 18: Consent React Hook — Frontend

**User Story:** As a frontend developer, I want a `useConsent` hook so that
React components can read and update consent state.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL provide a `useConsent` hook that returns the
   current `ConsentState` and methods to grant, revoke, and update consent.
2. THE hook SHALL trigger a re-render when consent state changes.
3. THE hook SHALL read the ConsentService from the DI container via the tracking
   context.

### Requirement 19: Consent React Hook — Mobile

**User Story:** As a mobile developer, I want a `useConsent` hook so that React
Native components can read and update consent state.

#### Acceptance Criteria

1. THE ReactNative_Tracking_Package SHALL provide a `useConsent` hook with the
   same API as the frontend `useConsent` hook.
2. THE hook SHALL trigger a re-render when consent state changes.

### Requirement 20: Segment Platform Enum Extension

**User Story:** As a backend developer, I want the Platform enum to include a
`SEGMENT` case so that the Segment driver is a first-class platform in the
tracking system.

#### Acceptance Criteria

1. THE `Platform` enum SHALL include a `SEGMENT` case with value `'segment'`.
2. THE TrackingCompiler SHALL recognize `'segment'` as a valid platform name
   when expanding `'*'` wildcard PlatformField attributes.

### Requirement 21: Event Schema Validation at Compile Time

**User Story:** As a backend developer, I want the TrackingCompiler to validate
that Event_DTO `#[PlatformField]` mappings produce valid payloads for each
platform so that misconfigured field maps are caught at compile time, not
runtime.

#### Acceptance Criteria

1. THE TrackingCompiler SHALL validate that each Event_DTO with
   `#[AsServerEvent]` has at least one `#[PlatformField]` attribute on its
   properties.
2. THE TrackingCompiler SHALL warn when a platform declared in
   `#[AsServerEvent(platforms: [...])]` has no corresponding `#[PlatformField]`
   mappings on any property.
3. THE TrackingCompiler SHALL validate that transform names used in
   `#[PlatformField]` are recognized values (`'wrapArray'`, `'toItem'`,
   `'toItems'`).
4. WHEN validation errors are found, THE TrackingCompiler SHALL report them in
   the `CompilerResult` message without failing the compilation (warnings, not
   errors).

### Requirement 22: Retry Dead Letter Queue

**User Story:** As a backend developer, I want events that fail all retry
attempts to be stored in a dead letter table so that they can be manually
reviewed and replayed.

#### Acceptance Criteria

1. THE Tracking_Module SHALL provide a migration creating a
   `tracking_dead_letters` table.
2. THE table SHALL include columns: `id` (primary key), `event_id` (UUID
   string), `event_class` (string), `event_data` (JSON), `platform` (string),
   `user_context` (JSON), `error_message` (text), `failed_at` (timestamp).
3. WHEN a SendServerEvent_Job exhausts all retry attempts, THE `failed()` method
   SHALL insert a row into the `tracking_dead_letters` table with the full event
   data and error message.
4. THE Tracking_Module SHALL provide an Artisan command
   `tracking:replay-dead-letters` that re-dispatches dead letter entries as new
   SendServerEvent jobs.
5. THE replay command SHALL accept optional `--platform` and `--event-type`
   filters to replay a subset of dead letters.
6. THE replay command SHALL mark replayed entries with a `replayed_at` timestamp
   to prevent duplicate replays.

### Requirement 23: Rate Limiting on Tracking Context Endpoint

**User Story:** As a backend developer, I want the `/api/tracking/context`
endpoint rate-limited so that it cannot be abused by automated clients.

#### Acceptance Criteria

1. THE `POST /api/tracking/context` endpoint SHALL be rate-limited to a
   configurable number of requests per minute per IP address.
2. THE rate limit SHALL default to 30 requests per minute.
3. THE rate limit SHALL be configurable via `config/tracking.php` under a
   `rate_limit` key.
4. WHEN the rate limit is exceeded, THE endpoint SHALL return a 429 Too Many
   Requests response.

### Requirement 24: PWA Event Hooks

**User Story:** As a frontend developer, I want PWA-specific event hooks so that
Progressive Web App lifecycle events (install prompt, push notification open,
offline page view) are tracked alongside standard web engagement events.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL provide a `useAppInstall` hook that fires an
   `AppInstall` event when the user accepts the `beforeinstallprompt` browser
   prompt.
2. THE React_Tracking_Package SHALL provide a `usePushOpen` hook that fires a
   `PushNotificationOpen` event when a service worker push notification is
   clicked.
3. THE React_Tracking_Package SHALL provide a `useOfflinePageView` hook that
   fires an `OfflinePageView` event when a page is served from the service
   worker cache while the device is offline.
4. EACH PWA hook SHALL no-op silently when the browser does not support the
   required API (e.g., `beforeinstallprompt`, Service Worker,
   `navigator.onLine`).

### Requirement 25: Desktop Event Hooks

**User Story:** As a frontend developer, I want desktop-specific event hooks so
that Electron/Tauri desktop app lifecycle events are tracked alongside standard
web engagement events.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL provide a `useDesktopAppOpen` hook that
   fires an `AppOpen` event when the desktop window gains focus from the system
   tray or after being minimized.
2. THE React_Tracking_Package SHALL provide a `useDesktopAppClose` hook that
   fires an `AppClose` event when the desktop window is closed to the system
   tray (not terminated).
3. THE React_Tracking_Package SHALL provide a `useSystemIdle` hook that fires a
   `SystemIdle` event when the user has been inactive for a configurable
   duration.
4. EACH desktop hook SHALL no-op silently when the application is not running in
   a desktop environment (Electron/Tauri).

### Requirement 26: A/B Test Variant Passthrough

**User Story:** As a product manager, I want tracking events to include the
active A/B test variant so that conversion attribution can be segmented by
experiment.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL accept an optional `experiments` field in
   the `TrackingConfig` containing a mapping of experiment names to variant
   names.
2. WHEN experiments are configured, THE PixelManager SHALL include the
   experiment-variant mapping as additional parameters in every pixel event
   dispatch.
3. THE backend TrackingService SHALL accept an optional `experiments` field in
   the user context and include it in the platform payload when present.
4. THE `POST /api/tracking/context` endpoint SHALL accept an optional
   `experiments` field and store it in the session alongside identity tokens and
   consent state.

### Requirement 27: Offline Conversion Upload

**User Story:** As a marketing team member, I want to batch-upload CRM
conversion data to advertising platforms so that offline purchases and
phone-order conversions are attributed to ad campaigns.

#### Acceptance Criteria

1. THE Tracking_Module SHALL provide an Artisan command
   `tracking:upload-offline-conversions` that reads conversion data from a
   configurable source (database query or CSV file).
2. THE command SHALL transform each conversion record into the platform-specific
   offline conversion format and send it via the corresponding
   `PlatformInterface` driver.
3. THE command SHALL support the `--platform` flag to target a specific platform
   (default: all configured platforms).
4. THE command SHALL log each uploaded conversion to the `event_delivery_log`
   table with an `offline` source indicator.
5. THE command SHALL support dry-run mode via `--dry-run` flag that logs what
   would be uploaded without making API calls.

### Requirement 28: Offline Event Queue — Frontend (Web)

**User Story:** As a frontend developer, I want engagement events queued locally
when the device is offline so that no tracking data is lost during connectivity
gaps, and events are flushed automatically when the connection is restored.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL provide an `OfflineQueueService` that
   intercepts event dispatch when `navigator.onLine` is `false`.
2. WHEN the device is offline, THE OfflineQueueService SHALL persist queued
   events to IndexedDB (preferred) or localStorage (fallback) so they survive
   page reloads and browser restarts.
3. WHEN connectivity is restored (via the `online` window event), THE
   OfflineQueueService SHALL flush all queued events to the PixelManager in FIFO
   order.
4. THE OfflineQueueService SHALL attach the original event timestamp to each
   queued event so that platforms receive accurate timing data.
5. THE OfflineQueueService SHALL enforce a configurable maximum queue size
   (default: 500 events) and discard the oldest events when the limit is
   exceeded.
6. THE PixelManager SHALL integrate with the OfflineQueueService so that all
   `fireEvent()` calls are automatically routed through the offline queue when
   the device is offline — no changes required in the TrackingService or hooks.
7. THE OfflineQueueService SHALL also queue identity sync requests
   (`POST /api/tracking/context`) when offline and flush them on reconnection.

### Requirement 29: Offline Event Queue — Mobile (React Native)

**User Story:** As a mobile developer, I want engagement events queued locally
when the device has no network connectivity so that no tracking data is lost,
and events are flushed automatically when the connection is restored.

#### Acceptance Criteria

1. THE ReactNative_Tracking_Package SHALL provide a `MobileOfflineQueueService`
   that intercepts event dispatch when the device has no network connectivity.
2. THE MobileOfflineQueueService SHALL detect connectivity status via
   `@react-native-community/netinfo` (or equivalent) and listen for connectivity
   change events.
3. WHEN the device is offline, THE MobileOfflineQueueService SHALL persist
   queued events to AsyncStorage (or MMKV if available) so they survive app
   restarts and background kills.
4. WHEN connectivity is restored, THE MobileOfflineQueueService SHALL flush all
   queued events to the NativeSdkService in FIFO order.
5. THE MobileOfflineQueueService SHALL attach the original event timestamp to
   each queued event so that native SDKs receive accurate timing data.
6. THE MobileOfflineQueueService SHALL enforce a configurable maximum queue size
   (default: 500 events) and discard the oldest events when the limit is
   exceeded.
7. THE NativeSdkService SHALL integrate with the MobileOfflineQueueService so
   that all `logEvent()` calls are automatically routed through the offline
   queue when the device is offline — no changes required in the
   MobileTrackingService or hooks.
8. THE MobileOfflineQueueService SHALL also queue identity sync requests when
   offline and flush them on reconnection.
9. THE `@react-native-community/netinfo` SHALL be declared as an optional peer
   dependency in the package's `package.json`.
