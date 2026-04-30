/**
 * @fileoverview Mobile tracking configuration interface.
 *
 * Defines the shape of the configuration object passed to
 * `MobileTrackingModule.forRoot()`. Controls which native SDKs are
 * initialized, the API base URL for identity sync, and mobile
 * engagement feature flags.
 *
 * @module @stackra/react-native-tracking
 * @category Interfaces
 */

/**
 * Configuration for the mobile tracking package.
 *
 * Passed to `MobileTrackingModule.forRoot(config)` to configure native SDK
 * credentials, identity sync endpoint, and mobile engagement tracking features.
 *
 * @example
 * ```typescript
 * const config: MobileTrackingConfig = {
 *   meta: { appId: '123456789', clientToken: 'abc123' },
 *   google: {},
 *   apiBaseUrl: 'https://api.example.com',
 *   enableAppOpen: true,
 *   enableScreenView: true,
 *   enableDeepLink: true,
 *   enablePushTracking: true,
 * };
 * ```
 */
export interface MobileTrackingConfig {
  /**
   * Meta (Facebook) SDK configuration.
   *
   * When provided, the FBSDK is initialized with the given app ID
   * and client token for event dispatch.
   *
   * @default undefined (Meta SDK disabled)
   */
  meta?: {
    /** The Meta App ID (e.g., `'123456789'`). */
    appId: string;

    /** The Meta Client Token for server-to-server calls. */
    clientToken: string;
  };

  /**
   * Google / Firebase Analytics configuration.
   *
   * When provided (even as empty object), Firebase Analytics is initialized
   * for event dispatch. Firebase reads its config from `google-services.json`
   * / `GoogleService-Info.plist` at the native layer.
   *
   * @default undefined (Firebase Analytics disabled)
   */
  google?: {};

  /**
   * Base URL for the tracking API endpoints.
   *
   * Used by the identity sync service to POST device advertising
   * identifiers to `{apiBaseUrl}/tracking/context`.
   *
   * @example 'https://api.example.com'
   */
  apiBaseUrl: string;

  /**
   * Whether to track AppOpen events on foreground transitions.
   *
   * When enabled, fires an event each time the app transitions
   * from background to active state.
   *
   * @default false
   */
  enableAppOpen?: boolean;

  /**
   * Whether to track ScreenView events on navigation changes.
   *
   * When enabled, fires an event each time a React Navigation
   * screen gains focus.
   *
   * @default false
   */
  enableScreenView?: boolean;

  /**
   * Whether to track DeepLink events.
   *
   * When enabled, fires an event when the app is opened via
   * a deep link URL.
   *
   * @default false
   */
  enableDeepLink?: boolean;

  /**
   * Whether to track push notification open events.
   *
   * When enabled, fires an event when a user taps a push notification.
   *
   * @default false
   */
  enablePushTracking?: boolean;
}
