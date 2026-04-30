/**
 * @fileoverview Mobile tracking service interface.
 *
 * Defines the contract for mobile engagement tracking operations.
 * Implementations orchestrate native SDK calls for app open, screen view,
 * deep link, and push notification open events. Commerce events (Purchase,
 * AddToCart, etc.) are NOT handled here — those are dispatched
 * exclusively by the backend.
 *
 * @module @stackra/react-native-tracking
 * @category Interfaces
 */

/**
 * Mobile tracking service interface for engagement events.
 *
 * Implementations coordinate native SDK calls (FBSDK, Firebase Analytics)
 * for engagement-only events. Each method dispatches the event to all
 * configured native SDKs.
 */
export interface IMobileTrackingService {
  /**
   * Track an app open event across all configured native SDKs.
   *
   * Fired when the application transitions from background to active state.
   * Dispatches to FBSDK (`AppEvents.logEvent`) and Firebase Analytics
   * (`analytics().logEvent`) as applicable.
   *
   * @returns void
   */
  trackAppOpen(): void;

  /**
   * Track a screen view event across all configured native SDKs.
   *
   * Fired when a React Navigation screen gains focus. Dispatches the
   * screen name to FBSDK and Firebase Analytics.
   *
   * @param screenName - The name of the screen being viewed.
   * @param screenClass - Optional screen class or component name.
   * @returns void
   */
  trackScreenView(screenName: string, screenClass?: string): void;

  /**
   * Track a deep link open event across all configured native SDKs.
   *
   * Fired when the application is opened via a deep link URL.
   *
   * @param url - The deep link URL that opened the app.
   * @returns void
   */
  trackDeepLink(url: string): void;

  /**
   * Track a push notification open event across all configured native SDKs.
   *
   * Fired when a user taps a push notification to open the app.
   *
   * @param notificationId - Optional identifier of the notification.
   * @param campaign - Optional campaign name associated with the notification.
   * @returns void
   */
  trackPushOpen(notificationId?: string, campaign?: string): void;
}
