# Requirements Document

## Introduction

A comprehensive server-side tracking and analytics system spanning three
platforms: a Laravel backend module (`modules/ab/tracking/`), a React frontend
package (`@stackra/react-tracking`), and a React Native mobile package
(`@stackra/react-native-tracking`). The backend serves as the authoritative
source for all commerce/conversion events, dispatching them to advertising
platforms (Meta CAPI, Google Measurement Protocol, TikTok Events API) via queued
jobs. The frontend and mobile clients handle engagement-only events (page views,
screen views, scroll depth) and synchronize user identity tokens with the
backend for cross-platform deduplication.

## Glossary

- **Tracking_Module**: The Laravel module at `modules/ab/tracking/` that
  provides server-side event dispatch, platform driver management, compile-time
  discovery, and client identity endpoints.
- **TrackingManager**: A `MultipleInstanceManager`-based service that resolves
  platform driver instances by name (e.g., `meta`, `google`, `tiktok`, `null`).
- **PlatformInterface**: The contract each advertising platform driver
  implements, defining how to transform and send event payloads.
- **TrackingCompiler**: A compile-time pass that discovers `#[Track]` and
  `#[AsServerEvent]` attributes via `Discovery::attribute()` and populates the
  TrackingRegistry.
- **TrackingRegistry**: A singleton registry holding the compiled map of event
  DTOs, their platform targets, and intercepted method bindings. Loaded from
  cache at runtime with zero reflection.
- **Track_Attribute**: An AOP interceptor attribute (`#[Track]`) extending
  `InterceptorAttribute` that, when placed on a method, triggers automatic event
  dispatch after the method executes.
- **AsServerEvent_Attribute**: A class-level attribute (`#[AsServerEvent]`)
  placed on Spatie Data DTOs to declare which platforms and event type the DTO
  represents.
- **PlatformField_Attribute**: A repeatable property-level attribute
  (`#[PlatformField]`) that maps DTO properties to platform-specific field names
  per platform, with optional structural transforms (`wrapArray`, `toItem`,
  `toItems`). The `'*'` wildcard applies the mapping to all platforms.
- **SendServerEvent_Job**: A queued Laravel job dispatched per-platform to
  deliver event payloads to the advertising platform API.
- **Event_DTO**: A Spatie Data object annotated with `#[AsServerEvent]` and
  `#[PlatformField]` that represents a tracking event (e.g., Purchase,
  AddToCart).
- **React_Tracking_Package**: The `@stackra/react-tracking` package in the
  frontend monorepo that handles browser engagement events and client-side pixel
  management.
- **ReactNative_Tracking_Package**: The `@stackra/react-native-tracking` package
  in the react-native-monorepo that handles mobile engagement events via native
  SDKs.
- **Tracking_Context**: A response header (`X-Tracking-Context`) and API
  endpoint (`POST /api/tracking/context`) used for cross-platform event
  deduplication and identity synchronization.
- **User_Identity**: A collection of platform-specific identifiers (fbp, fbc,
  ga_client_id, IDFA, GAID) that the client sends to the backend for inclusion
  in server-side event payloads.

## Requirements

### Requirement 1: Track Attribute AOP Interceptor

**User Story:** As a backend developer, I want to annotate service methods with
`#[Track]` so that tracking events are dispatched automatically after the method
executes, without embedding tracking logic in business code.

#### Acceptance Criteria

1. WHEN a method annotated with `#[Track]` executes successfully, THE
   Tracking_Module SHALL dispatch the configured Event_DTO to all platforms
   declared in the corresponding AsServerEvent_Attribute.
2. THE Track_Attribute SHALL extend `InterceptorAttribute` and declare its
   interceptor class via the `#[InterceptedBy]` meta-attribute, following the
   same pattern as the existing `#[Emits]` attribute.
3. WHEN a method annotated with `#[Track]` throws an exception, THE
   Tracking_Module SHALL propagate the exception without dispatching any
   tracking event.
4. THE Track_Attribute SHALL accept an `event` parameter specifying the
   Event_DTO class to dispatch.
5. THE Track_Attribute SHALL accept an optional `extract` parameter mapping
   method return value properties to Event_DTO constructor parameters, following
   the same pattern as the `#[Emits]` attribute.

### Requirement 2: AsServerEvent Attribute for Event DTOs

**User Story:** As a backend developer, I want to declare tracking event
metadata directly on my Spatie Data DTOs so that the compiler can discover them
and the runtime knows which platforms to target.

#### Acceptance Criteria

1. THE AsServerEvent_Attribute SHALL be a class-level PHP attribute targeting
   Spatie Data DTOs.
2. THE AsServerEvent_Attribute SHALL accept a `platforms` parameter specifying
   an array of platform driver names (e.g., `['meta', 'google', 'tiktok']`).
3. THE AsServerEvent_Attribute SHALL accept an `eventType` parameter specifying
   the canonical event name (e.g., `Purchase`, `AddToCart`, `ViewContent`).
4. WHEN no `platforms` parameter is provided, THE Tracking_Module SHALL use the
   default platforms defined in `config/tracking.php`.

### Requirement 3: PlatformField Attribute for Per-Platform Property Mapping

**User Story:** As a backend developer, I want to annotate DTO properties with
per-platform field names and optional structural transforms so that the compiler
builds field maps and platform classes can generically map fields without
per-event-type code.

#### Acceptance Criteria

1. THE PlatformField_Attribute SHALL be a repeatable property-level PHP
   attribute (`Attribute::TARGET_PROPERTY | Attribute::IS_REPEATABLE`).
2. THE PlatformField_Attribute SHALL accept a `platform` parameter specifying
   the target platform name (`'meta'`, `'google'`, `'tiktok'`) or `'*'` for all
   platforms.
3. THE PlatformField_Attribute SHALL accept a `field` parameter specifying the
   platform-specific output field name.
4. THE PlatformField_Attribute SHALL accept an optional `transform` parameter
   specifying a structural transform (`'wrapArray'`, `'toItem'`, `'toItems'`).
5. WHEN the TrackingCompiler discovers PlatformField attributes, THE compiled
   registry SHALL contain the correct per-platform field maps for each
   Event_DTO.
6. WHEN a PlatformField uses the `'*'` wildcard platform, THE compiler SHALL
   expand it to all platforms declared in the event's `#[AsServerEvent]`
   attribute.

### Requirement 4: TrackingCompiler Discovery

**User Story:** As a backend developer, I want tracking attributes to be
discovered at compile time so that runtime lookups require zero reflection
overhead.

#### Acceptance Criteria

1. THE TrackingCompiler SHALL implement `CompilerInterface` and be annotated
   with `#[AsCompiler]` in the REGISTRY phase.
2. THE TrackingCompiler SHALL use `Discovery::attribute(AsServerEvent::class)`
   to discover all Event_DTO classes annotated with `#[AsServerEvent]`.
3. THE TrackingCompiler SHALL use `Discovery::attribute(Track::class)` to
   discover all methods annotated with `#[Track]`.
4. THE TrackingCompiler SHALL discover `#[PlatformField]` attributes on DTO
   properties and build per-platform field maps in the registry cache.
5. THE TrackingCompiler SHALL populate the TrackingRegistry with the discovered
   event-to-platform mappings, per-platform field maps, and method-to-event
   bindings.
6. THE TrackingCompiler SHALL return a `CompilerResult` reporting the count of
   discovered events and tracked methods.
7. WHEN no `#[AsServerEvent]` or `#[Track]` attributes are found, THE
   TrackingCompiler SHALL return a skipped `CompilerResult`.

### Requirement 5: TrackingRegistry Runtime Lookups

**User Story:** As a backend developer, I want a singleton registry that
provides zero-reflection lookups for event metadata at runtime.

#### Acceptance Criteria

1. THE TrackingRegistry SHALL be a singleton class annotated with
   `#[Singleton]`.
2. THE TrackingRegistry SHALL load its compiled event map from a cache file at
   `bootstrap/cache/tracking_events.php` on first access.
3. THE TrackingRegistry SHALL provide a method to retrieve the platform list and
   event type for a given Event_DTO class name.
4. THE TrackingRegistry SHALL provide a method to retrieve the Event_DTO class
   associated with a given tracked method.
5. WHEN the cache file does not exist, THE TrackingRegistry SHALL return empty
   results without throwing an exception.

### Requirement 6: TrackingManager Platform Driver Resolution

**User Story:** As a backend developer, I want a manager service that resolves
platform drivers by name so that I can add new advertising platforms without
modifying existing code.

#### Acceptance Criteria

1. THE TrackingManager SHALL extend Laravel's `MultipleInstanceManager` pattern
   to resolve PlatformInterface implementations by driver name.
2. THE TrackingManager SHALL read platform driver configuration from
   `config/tracking.php`.
3. THE TrackingManager SHALL support resolving the following built-in drivers:
   `meta`, `google`, `tiktok`, and `null`.
4. WHEN an unknown driver name is requested, THE TrackingManager SHALL throw an
   `InvalidArgumentException` with a descriptive message.
5. THE TrackingManager SHALL cache resolved driver instances for the lifetime of
   the request.

### Requirement 7: PlatformInterface Contract

**User Story:** As a backend developer, I want a clear contract for platform
drivers so that each advertising platform can transform and send event payloads
in its own format.

#### Acceptance Criteria

1. THE PlatformInterface SHALL define a `send` method accepting an Event_DTO
   instance and a user context array.
2. THE PlatformInterface SHALL define a `transformPayload` method that converts
   an Event_DTO into the platform-specific request body format.
3. THE PlatformInterface SHALL define a `platformName` method returning the
   driver's string identifier.

### Requirement 8: Meta CAPI Platform Driver

**User Story:** As a marketing team member, I want purchase and conversion
events sent to Meta's Conversions API so that ad attribution is accurate even
with browser tracking restrictions.

#### Acceptance Criteria

1. THE MetaCapiPlatform SHALL implement PlatformInterface.
2. THE MetaCapiPlatform SHALL transform Event_DTO payloads into Meta CAPI
   format, mapping properties to Meta's expected schema (e.g., `content_ids[]`,
   `content_type`, `value`, `currency`).
3. THE MetaCapiPlatform SHALL hash user email and phone values using SHA-256
   before including them in the payload, as required by Meta's data processing
   rules.
4. THE MetaCapiPlatform SHALL include the `event_id` field in every payload for
   deduplication with the client-side Meta Pixel.
5. THE MetaCapiPlatform SHALL read its access token and pixel ID from
   `config/tracking.php`.

### Requirement 9: Google Measurement Protocol Platform Driver

**User Story:** As a marketing team member, I want conversion events sent to
Google Analytics 4 via the Measurement Protocol so that server-side events
appear in GA4 reports.

#### Acceptance Criteria

1. THE GoogleMeasurementPlatform SHALL implement PlatformInterface.
2. THE GoogleMeasurementPlatform SHALL transform Event_DTO payloads into GA4
   Measurement Protocol format, mapping properties to Google's expected schema
   (e.g., `items[].item_id`, `items[].item_name`, `value`, `currency`).
3. THE GoogleMeasurementPlatform SHALL include the `client_id` parameter from
   the user context in every payload.
4. THE GoogleMeasurementPlatform SHALL read its measurement ID and API secret
   from `config/tracking.php`.

### Requirement 10: TikTok Events API Platform Driver

**User Story:** As a marketing team member, I want conversion events sent to
TikTok's Events API so that TikTok ad campaigns receive accurate attribution
data.

#### Acceptance Criteria

1. THE TikTokEventsPlatform SHALL implement PlatformInterface.
2. THE TikTokEventsPlatform SHALL transform Event_DTO payloads into TikTok
   Events API format.
3. THE TikTokEventsPlatform SHALL hash user email and phone values using SHA-256
   before including them in the payload, as required by TikTok's data processing
   rules.
4. THE TikTokEventsPlatform SHALL read its access token and pixel code from
   `config/tracking.php`.

### Requirement 11: NullPlatform Driver

**User Story:** As a backend developer, I want a null platform driver for
testing and local development so that tracking code executes without making
external API calls.

#### Acceptance Criteria

1. THE NullPlatform SHALL implement PlatformInterface.
2. THE NullPlatform SHALL accept event payloads without performing any external
   HTTP requests.
3. THE NullPlatform SHALL log dispatched events at the `debug` level for local
   development visibility.

### Requirement 12: Queued Event Dispatch

**User Story:** As a backend developer, I want tracking events dispatched via
queued jobs so that API response times are not affected by external platform API
calls.

#### Acceptance Criteria

1. WHEN a tracking event is dispatched, THE Tracking_Module SHALL create a
   separate SendServerEvent_Job for each target platform.
2. THE SendServerEvent_Job SHALL be dispatched to the `tracking` queue as
   defined in `config/tracking.php`.
3. THE SendServerEvent_Job SHALL serialize the Event_DTO and user context for
   queue transport.
4. IF a SendServerEvent_Job fails after the configured maximum attempts, THEN
   THE Tracking_Module SHALL log the failure with the platform name, event type,
   and error message.
5. THE SendServerEvent_Job SHALL implement retry backoff with exponential delay.

### Requirement 13: Tracking Configuration

**User Story:** As a backend developer, I want all tracking settings centralized
in a single config file so that platform credentials and behavior can be managed
per environment.

#### Acceptance Criteria

1. THE Tracking_Module SHALL provide a `config/tracking.php` configuration file.
2. THE configuration file SHALL define platform credentials (access tokens,
   pixel IDs, measurement IDs, API secrets) sourced from environment variables.
3. THE configuration file SHALL define a `default` array specifying
   which platforms receive events when no explicit platform list is provided.
4. THE configuration file SHALL define queue settings including the queue name
   and connection for SendServerEvent_Job.
5. THE configuration file SHALL define a `hashing` section specifying the
   algorithm (SHA-256) used for user identity fields.

### Requirement 14: Tracking Service Provider

**User Story:** As a backend developer, I want the tracking module to register
itself following the existing module service provider pattern so that it
integrates seamlessly with the application bootstrap.

#### Acceptance Criteria

1. THE TrackingServiceProvider SHALL extend
   `Stackra\ServiceProvider\Providers\ServiceProvider`.
2. THE TrackingServiceProvider SHALL be annotated with `#[Module]` and
   `#[LoadsResources]` attributes.
3. THE TrackingServiceProvider SHALL register the TrackingManager,
   TrackingRegistry, and PlatformInterface bindings in the service container.
4. THE TrackingServiceProvider SHALL publish the `config/tracking.php`
   configuration file.

### Requirement 15: Tracking Context Response Header

**User Story:** As a frontend developer, I want the backend to include a
tracking context header in API responses so that client-side pixels can
deduplicate events using the same event ID.

#### Acceptance Criteria

1. WHEN a tracking event is dispatched during a request, THE Tracking_Module
   SHALL include an `X-Tracking-Context` response header containing the
   `event_id` used for that event.
2. THE `event_id` SHALL be a UUID v4 string generated per tracking event
   dispatch.
3. THE React_Tracking_Package SHALL read the `X-Tracking-Context` header from
   API responses to obtain the `event_id` for client-side pixel deduplication.

### Requirement 16: Client Identity Sync Endpoint

**User Story:** As a frontend developer, I want to send client-side identity
tokens (fbp, fbc, ga_client_id) to the backend so that server-side events
include accurate user identity for attribution.

#### Acceptance Criteria

1. THE Tracking_Module SHALL expose a `POST /api/tracking/context` endpoint that
   accepts client identity tokens.
2. THE endpoint SHALL accept the following fields: `fbp`, `fbc`, `ga_client_id`,
   `idfa`, `gaid`.
3. THE endpoint SHALL validate that at least one identity field is present in
   the request.
4. THE endpoint SHALL store the received identity tokens in the user's session
   or an associated storage mechanism for inclusion in subsequent server-side
   event payloads.
5. IF the request contains no valid identity fields, THEN THE endpoint SHALL
   return a 422 validation error with a descriptive message.

### Requirement 17: Event DTO Definitions

**User Story:** As a backend developer, I want pre-built Spatie Data DTOs for
standard commerce events so that tracking common conversions requires no
boilerplate.

#### Acceptance Criteria

1. THE Tracking_Module SHALL provide Event_DTO classes for the following event
   types: Purchase, AddToCart, ViewContent, Search, InitiateCheckout, and
   Registration.
2. EACH Event_DTO SHALL be annotated with `#[AsServerEvent]` declaring its event
   type and default platforms.
3. EACH Event_DTO SHALL use `#[PlatformField]` on properties that require
   per-platform field name mapping and optional structural transforms.
4. EACH Event_DTO SHALL be constructable from the corresponding source model via
   Spatie Data's `Data::from($model)` pattern, with properties matching the
   source model shape.

### Requirement 18: User Identity Hashing

**User Story:** As a compliance officer, I want user PII (email, phone) to be
hashed before transmission to advertising platforms so that the system complies
with platform data processing requirements.

#### Acceptance Criteria

1. WHEN an Event_DTO contains user email or phone fields, THE PlatformInterface
   implementation SHALL hash those values using SHA-256 before including them in
   the outbound payload.
2. THE hashing SHALL normalize email addresses to lowercase and remove
   leading/trailing whitespace before hashing.
3. THE hashing SHALL normalize phone numbers to E.164 format before hashing.
4. IF an email or phone field is already a valid SHA-256 hash (64 hex
   characters), THEN THE PlatformInterface implementation SHALL pass the value
   through without re-hashing.

### Requirement 19: React Tracking Package — Browser Engagement Events

**User Story:** As a frontend developer, I want a React package that
automatically tracks page views, scroll depth, time on page, and CTA clicks so
that engagement analytics are captured without manual instrumentation.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL track PageView events on route changes,
   deduplicating against server-dispatched page views using the
   `X-Tracking-Context` header.
2. THE React_Tracking_Package SHALL track scroll depth at configurable
   percentage thresholds (e.g., 25%, 50%, 75%, 100%).
3. THE React_Tracking_Package SHALL track time-on-page duration, reporting the
   value when the user navigates away or the page becomes hidden.
4. THE React_Tracking_Package SHALL track CTA click events on elements annotated
   with a `data-track-cta` attribute.
5. THE React_Tracking_Package SHALL load and initialize platform pixel scripts
   (Meta Pixel, gtag.js, TikTok pixel) based on configuration.

### Requirement 20: React Tracking Package — Client Identity Sync

**User Story:** As a frontend developer, I want the React tracking package to
automatically read browser cookies (fbp, fbc) and send them to the backend so
that server-side events have accurate user identity.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL read the `_fbp` and `_fbc` cookies from the
   browser.
2. THE React_Tracking_Package SHALL read the Google Analytics `_ga` cookie to
   extract the `ga_client_id`.
3. WHEN identity cookies are available, THE React_Tracking_Package SHALL send
   them to the `POST /api/tracking/context` endpoint on initialization and when
   cookie values change.

### Requirement 21: React Tracking Package — Architecture

**User Story:** As a frontend developer, I want the React tracking package to
follow existing @stackra package patterns (DI module, facade, hooks, providers)
so that it integrates consistently with the frontend architecture.

#### Acceptance Criteria

1. THE React_Tracking_Package SHALL provide a `TrackingModule` with a
   `forRoot()` static method for configuration.
2. THE React_Tracking_Package SHALL provide a `TrackingFacade` typed constant
   for static-style access to the tracking service.
3. THE React_Tracking_Package SHALL provide a `useTracking` hook for React
   components to access tracking methods.
4. THE React_Tracking_Package SHALL provide a `TrackingProvider` React context
   provider that initializes pixel scripts and identity sync.
5. THE React_Tracking_Package SHALL NOT dispatch commerce events (Purchase,
   AddToCart, etc.) — those are handled exclusively by the backend.

### Requirement 22: React Native Tracking Package — Mobile Engagement Events

**User Story:** As a mobile developer, I want a React Native package that tracks
app-specific engagement events so that mobile analytics are captured using
native SDKs.

#### Acceptance Criteria

1. THE ReactNative_Tracking_Package SHALL track AppOpen events when the
   application transitions from background to foreground.
2. THE ReactNative_Tracking_Package SHALL track ScreenView events on navigation
   screen changes.
3. THE ReactNative_Tracking_Package SHALL track DeepLink events when the
   application is opened via a deep link URL.
4. THE ReactNative_Tracking_Package SHALL track push notification open events
   when a user taps a push notification.
5. THE ReactNative_Tracking_Package SHALL use native SDKs
   (`react-native-fbsdk-next` for Meta, `@react-native-firebase/analytics` for
   Google) for event dispatch.

### Requirement 23: React Native Tracking Package — Mobile Identity Sync

**User Story:** As a mobile developer, I want the React Native tracking package
to send device advertising identifiers (IDFA, GAID) to the backend so that
server-side events include mobile device identity.

#### Acceptance Criteria

1. THE ReactNative_Tracking_Package SHALL retrieve the IDFA (iOS) or GAID
   (Android) from the device, respecting the user's App Tracking Transparency
   (ATT) consent status.
2. WHEN a device advertising identifier is available, THE
   ReactNative_Tracking_Package SHALL send the identifier to the
   `POST /api/tracking/context` endpoint.
3. IF the user has not granted tracking permission (ATT denied on iOS), THEN THE
   ReactNative_Tracking_Package SHALL omit the IDFA from the identity sync
   request.
4. THE ReactNative_Tracking_Package SHALL NOT dispatch commerce events
   (Purchase, AddToCart, etc.) — those are handled exclusively by the backend.

### Requirement 24: Cross-Platform Event Deduplication

**User Story:** As a marketing team member, I want events to be deduplicated
between client-side pixels and server-side API calls so that conversion counts
are accurate and not double-counted.

#### Acceptance Criteria

1. THE Tracking_Module SHALL generate a unique `event_id` (UUID v4) for each
   server-side event dispatch.
2. THE Tracking_Module SHALL include the `event_id` in both the server-side API
   payload and the `X-Tracking-Context` response header.
3. THE React_Tracking_Package SHALL pass the `event_id` from the
   `X-Tracking-Context` header to the corresponding client-side pixel event
   call.
4. THE MetaCapiPlatform SHALL include the `event_id` field in the CAPI payload
   to enable Meta's server-to-browser deduplication.

### Requirement 25: Platform Extensibility

**User Story:** As a backend developer, I want to add new advertising platform
drivers without modifying existing code so that the tracking system can grow
with business needs.

#### Acceptance Criteria

1. THE TrackingManager SHALL allow registering custom platform drivers via the
   `config/tracking.php` configuration file by specifying a driver name and its
   implementing class.
2. WHEN a custom driver class is configured, THE TrackingManager SHALL resolve
   the class from the service container.
3. THE custom driver class SHALL implement PlatformInterface to ensure
   compatibility with the dispatch pipeline.

### Requirement 26: Event DTO Round-Trip Serialization

**User Story:** As a backend developer, I want Event DTOs to serialize and
deserialize correctly through the queue so that no data is lost during queued
dispatch.

#### Acceptance Criteria

1. FOR ALL valid Event_DTO instances, serializing to array then reconstructing
   via `Data::from($array)` SHALL produce an equivalent Event_DTO (round-trip
   property).
2. THE SendServerEvent_Job SHALL serialize Event_DTO instances using Spatie
   Data's `toArray()` method for queue transport.
3. THE SendServerEvent_Job SHALL reconstruct Event_DTO instances from the
   serialized array using `Data::from()` before passing them to the platform
   driver.
