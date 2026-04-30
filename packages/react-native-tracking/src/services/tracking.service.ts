/**
 * @fileoverview MobileTrackingService — orchestrates mobile engagement event dispatch.
 *
 * Dispatches engagement events (app open, screen view, deep link,
 * push notification open) to all configured native SDKs via the
 * {@link NativeSdkService}. Reads feature flags from the
 * {@link MobileTrackingConfig} to determine which events are enabled.
 *
 * This service does NOT dispatch commerce events (Purchase, AddToCart, etc.)
 * — those are handled exclusively by the backend tracking module.
 *
 * @module @stackra/react-native-tracking
 * @category Services
 */

import { Injectable, Inject } from "@stackra/ts-container";

import { TRACKING_CONFIG } from "@/constants/tokens.constant";
import { MobileEvent } from "@/enums/mobile-event.enum";
import type { MobileTrackingConfig } from "@/interfaces/tracking-config.interface";
import type { IMobileTrackingService } from "@/interfaces/tracking-service.interface";
import { NativeSdkService } from "@/services/native-sdk.service";

/**
 * MobileTrackingService — mobile engagement event orchestrator.
 *
 * Coordinates native SDK calls across FBSDK and Firebase Analytics
 * for engagement-only events. Each method checks the corresponding
 * feature flag in {@link MobileTrackingConfig} before dispatching.
 *
 * @example
 * ```typescript
 * const tracking = container.get<IMobileTrackingService>(TRACKING_SERVICE);
 * tracking.trackAppOpen();
 * tracking.trackScreenView('HomeScreen', 'HomeScreen');
 * ```
 */
@Injectable()
export class MobileTrackingService implements IMobileTrackingService {
  /**
   * Create a new MobileTrackingService instance.
   *
   * @param config - The mobile tracking configuration injected via DI.
   * @param nativeSdk - The native SDK service for dispatching events.
   */
  public constructor(
    @Inject(TRACKING_CONFIG) private readonly config: MobileTrackingConfig,
    @Inject(NativeSdkService) private readonly nativeSdk: NativeSdkService,
  ) {}

  // ── Engagement Events ─────────────────────────────────────────────

  /**
   * Track an app open event across all configured native SDKs.
   *
   * Fires when the application transitions from background to active.
   * No-ops if `enableAppOpen` is not set in the config.
   *
   * @returns void
   */
  public trackAppOpen(): void {
    if (!this.config.enableAppOpen) return;

    this.nativeSdk.logEvent(MobileEvent.APP_OPEN, {});
  }

  /**
   * Track a screen view event across all configured native SDKs.
   *
   * Fires when a React Navigation screen gains focus. No-ops if
   * `enableScreenView` is not set in the config.
   *
   * @param screenName - The name of the screen being viewed.
   * @param screenClass - Optional screen class or component name.
   * @returns void
   */
  public trackScreenView(screenName: string, screenClass?: string): void {
    if (!this.config.enableScreenView) return;

    this.nativeSdk.logEvent(MobileEvent.SCREEN_VIEW, {
      screen_name: screenName,
      screen_class: screenClass,
    });
  }

  /**
   * Track a deep link open event across all configured native SDKs.
   *
   * Fires when the application is opened via a deep link URL. No-ops
   * if `enableDeepLink` is not set in the config.
   *
   * @param url - The deep link URL that opened the app.
   * @returns void
   */
  public trackDeepLink(url: string): void {
    if (!this.config.enableDeepLink) return;

    this.nativeSdk.logEvent(MobileEvent.DEEP_LINK, { url });
  }

  /**
   * Track a push notification open event across all configured native SDKs.
   *
   * Fires when a user taps a push notification. No-ops if
   * `enablePushTracking` is not set in the config.
   *
   * @param notificationId - Optional identifier of the notification.
   * @param campaign - Optional campaign name associated with the notification.
   * @returns void
   */
  public trackPushOpen(notificationId?: string, campaign?: string): void {
    if (!this.config.enablePushTracking) return;

    this.nativeSdk.logEvent(MobileEvent.PUSH_NOTIFICATION_OPEN, {
      notification_id: notificationId,
      campaign,
    });
  }
}
