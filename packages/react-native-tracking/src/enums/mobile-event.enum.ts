/**
 * @fileoverview Mobile engagement event types.
 *
 * Defines the canonical event names for mobile engagement tracking.
 * These are engagement-only events — commerce events are handled
 * exclusively by the backend tracking module.
 *
 * @module @stackra/react-native-tracking
 * @category Enums
 */

/**
 * Mobile engagement event types.
 *
 * Used by {@link MobileTrackingService} to identify which event
 * to dispatch to native SDKs.
 */
export enum MobileEvent {
  /** Fired when the app transitions from background to active. */
  APP_OPEN = "app_open",

  /** Fired on React Navigation screen focus changes. */
  SCREEN_VIEW = "screen_view",

  /** Fired when the app is opened via a deep link URL. */
  DEEP_LINK = "deep_link",

  /** Fired when a user taps a push notification. */
  PUSH_NOTIFICATION_OPEN = "push_notification_open",
}
