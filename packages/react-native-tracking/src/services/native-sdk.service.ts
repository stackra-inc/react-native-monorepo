/**
 * @fileoverview NativeSdkService — unified interface for native SDK event dispatch.
 *
 * Initializes FBSDK and Firebase Analytics based on the provided
 * {@link MobileTrackingConfig}. Provides a single `logEvent()` method
 * that dispatches events to all configured native SDKs.
 *
 * Native SDK imports are dynamically resolved to avoid crashes when
 * optional peer dependencies are not installed.
 *
 * @module @stackra/react-native-tracking
 * @category Services
 */

import { Injectable, Inject } from "@stackra/ts-container";

import { TRACKING_CONFIG, CONSENT_SERVICE, OFFLINE_QUEUE } from "@/constants/tokens.constant";
import { ConsentCategory } from "@/enums/consent-category.enum";
import type { MobileTrackingConfig } from "@/interfaces/tracking-config.interface";
import type { ConsentService } from "@/services/consent.service";
import type { MobileOfflineQueueService } from "@/services/mobile-offline-queue.service";

/**
 * NativeSdkService — initializes and dispatches events to native SDKs.
 *
 * Wraps FBSDK (`react-native-fbsdk-next`) and Firebase Analytics
 * (`@react-native-firebase/analytics`) behind a unified dispatch interface.
 * SDKs are lazily resolved on first use to handle optional peer dependencies
 * gracefully.
 *
 * @example
 * ```typescript
 * const sdk = container.get(NativeSdkService);
 * await sdk.initialize();
 * sdk.logEvent('screen_view', { screen_name: 'Home' });
 * ```
 */
@Injectable()
export class NativeSdkService {
  /** Whether the native SDKs have been initialized. */
  private initialized: boolean = false;

  /** Cached reference to the FBSDK AppEventsLogger, or null if unavailable. */
  private fbAppEvents: any = null;

  /** Cached reference to the Firebase Analytics module, or null if unavailable. */
  private firebaseAnalytics: any = null;

  /**
   * Create a new NativeSdkService instance.
   *
   * @param config - The mobile tracking configuration injected via DI.
   * @param consent - The consent service for checking marketing consent.
   * @param offlineQueue - The offline queue service for queuing events when offline.
   */
  public constructor(
    @Inject(TRACKING_CONFIG) private readonly config: MobileTrackingConfig,
    @Inject(CONSENT_SERVICE) private readonly consent: ConsentService,
    @Inject(OFFLINE_QUEUE) private readonly offlineQueue: MobileOfflineQueueService,
  ) {}

  /**
   * Initialize all configured native SDKs.
   *
   * Dynamically imports FBSDK and Firebase Analytics modules based on
   * the config. Catches import errors gracefully when optional peer
   * dependencies are not installed.
   *
   * Safe to call multiple times — subsequent calls are no-ops.
   *
   * @returns A promise that resolves when initialization is complete.
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;
    if (!this.consent.hasConsent(ConsentCategory.MARKETING)) return;

    // Initialize FBSDK if Meta config is provided
    if (this.config.meta) {
      try {
        const fbsdk = await import("react-native-fbsdk-next");
        const { Settings, AppEventsLogger } = fbsdk;

        Settings.setAppID(this.config.meta.appId);
        Settings.setClientToken(this.config.meta.clientToken);
        await Settings.initializeSDK();

        this.fbAppEvents = AppEventsLogger;
      } catch {
        // FBSDK not installed — skip silently
      }
    }

    // Initialize Firebase Analytics if Google config is provided
    if (this.config.google) {
      try {
        const firebaseModule = await import("@react-native-firebase/analytics");
        this.firebaseAnalytics = firebaseModule.default;
      } catch {
        // Firebase Analytics not installed — skip silently
      }
    }

    this.initialized = true;
  }

  /**
   * Log an event to all configured native SDKs.
   *
   * Dispatches the event name and parameters to FBSDK and Firebase
   * Analytics. No-ops silently for SDKs that are not initialized.
   *
   * @param eventName - The canonical event name (e.g., `'screen_view'`).
   * @param params - Event-specific parameters as key-value pairs.
   * @returns void
   */
  public logEvent(eventName: string, params: Record<string, unknown>): void {
    if (!this.consent.hasConsent(ConsentCategory.MARKETING)) return;

    // Queue for later if offline
    if (!this.offlineQueue.isOnline()) {
      this.offlineQueue.enqueue({
        eventName,
        params,
        timestamp: Date.now(),
        type: "pixel",
      });
      return;
    }

    this.logFbEvent(eventName, params);
    this.logFirebaseEvent(eventName, params);
  }

  // ── Private SDK Dispatchers ───────────────────────────────────────

  /**
   * Log an event via FBSDK AppEventsLogger.
   *
   * No-ops silently if FBSDK is not initialized or not available.
   *
   * @param eventName - The event name.
   * @param params - Event parameters.
   */
  private logFbEvent(eventName: string, params: Record<string, unknown>): void {
    if (!this.fbAppEvents) return;

    try {
      this.fbAppEvents.logEvent(eventName, params);
    } catch {
      // Swallow SDK errors to prevent app crashes
    }
  }

  /**
   * Log an event via Firebase Analytics.
   *
   * No-ops silently if Firebase Analytics is not initialized or not available.
   *
   * @param eventName - The event name.
   * @param params - Event parameters.
   */
  private logFirebaseEvent(eventName: string, params: Record<string, unknown>): void {
    if (!this.firebaseAnalytics) return;

    try {
      this.firebaseAnalytics().logEvent(eventName, params);
    } catch {
      // Swallow SDK errors to prevent app crashes
    }
  }
}
