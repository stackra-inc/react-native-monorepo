/**
 * @fileoverview DI tokens for the mobile tracking package.
 *
 * All Symbol-based injection tokens for `@stackra/react-native-tracking` are
 * centralized here. Never define `Symbol.for()` tokens elsewhere.
 *
 * @module @stackra/react-native-tracking
 * @category Constants
 */

/**
 * DI token for the {@link IMobileTrackingService} implementation.
 *
 * Injected into components and hooks that need to dispatch
 * mobile engagement events (app open, screen view, deep link, push open).
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyService {
 *   constructor(@Inject(TRACKING_SERVICE) private tracking: IMobileTrackingService) {}
 * }
 * ```
 */
export const TRACKING_SERVICE = Symbol.for("MOBILE_TRACKING_SERVICE");

/**
 * DI token for the {@link MobileTrackingConfig} configuration object.
 *
 * Provided by `MobileTrackingModule.forRoot(config)` and consumed by
 * services that need native SDK credentials, API base URL, or feature flags.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class NativeSdkService {
 *   constructor(@Inject(TRACKING_CONFIG) private config: MobileTrackingConfig) {}
 * }
 * ```
 */
export const TRACKING_CONFIG = Symbol.for("MOBILE_TRACKING_CONFIG");

/**
 * DI token for the mobile {@link ConsentService}.
 *
 * Injected into services that need to check or update user consent
 * state before dispatching tracking events.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class NativeSdkService {
 *   constructor(@Inject(CONSENT_SERVICE) private consent: ConsentService) {}
 * }
 * ```
 */
export const CONSENT_SERVICE = Symbol.for("MOBILE_CONSENT_SERVICE");

/**
 * DI token for the mobile {@link MobileOfflineQueueService}.
 *
 * Injected into services that need to queue events when the device
 * is offline and flush them on reconnection.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class NativeSdkService {
 *   constructor(@Inject(OFFLINE_QUEUE) private offlineQueue: MobileOfflineQueueService) {}
 * }
 * ```
 */
export const OFFLINE_QUEUE = Symbol.for("MOBILE_OFFLINE_QUEUE");
