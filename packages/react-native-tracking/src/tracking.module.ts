/**
 * @fileoverview MobileTrackingModule — DI module for mobile engagement tracking.
 *
 * `forRoot()` registers MobileTrackingService, NativeSdkService,
 * MobileIdentitySyncService, ConsentService, MobileOfflineQueueService,
 * and the MobileTrackingConfig in the DI container.
 *
 * @module @stackra/react-native-tracking
 * @category Module
 */

import { MobileTrackingService } from "@/services/tracking.service";
import { NativeSdkService } from "@/services/native-sdk.service";
import { MobileIdentitySyncService } from "@/services/identity-sync.service";
import { ConsentService } from "@/services/consent.service";
import { MobileOfflineQueueService } from "@/services/mobile-offline-queue.service";
import { TRACKING_SERVICE, TRACKING_CONFIG, CONSENT_SERVICE, OFFLINE_QUEUE } from "@/constants";
import type { MobileTrackingConfig } from "@/interfaces/tracking-config.interface";

/**
 * DI module for mobile engagement tracking, native SDK management, and identity sync.
 *
 * Usage:
 * ```typescript
 * @Module({
 *   imports: [
 *     MobileTrackingModule.forRoot({
 *       meta: { appId: '123456789', clientToken: 'abc123' },
 *       google: {},
 *       apiBaseUrl: 'https://api.example.com',
 *       enableAppOpen: true,
 *       enableScreenView: true,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
export class MobileTrackingModule {
  /**
   * Configure the mobile tracking module with SDK credentials and feature flags.
   *
   * Registers all mobile tracking services in the DI container and makes them
   * available globally. The config is provided via the `TRACKING_CONFIG`
   * token and consumed by all tracking services.
   *
   * @param config - The mobile tracking configuration with SDK credentials,
   *   API base URL, and engagement feature flags.
   * @returns A dynamic module definition with providers and exports.
   *
   * @example
   * ```typescript
   * MobileTrackingModule.forRoot({
   *   meta: { appId: '123456789', clientToken: 'abc123' },
   *   google: {},
   *   apiBaseUrl: 'https://api.example.com',
   *   enableAppOpen: true,
   *   enableScreenView: true,
   *   enableDeepLink: true,
   *   enablePushTracking: true,
   * });
   * ```
   */
  public static forRoot(config: MobileTrackingConfig) {
    const providers: any[] = [
      { provide: TRACKING_CONFIG, useValue: config },
      { provide: TRACKING_SERVICE, useClass: MobileTrackingService },
      { provide: NativeSdkService, useClass: NativeSdkService },
      { provide: MobileIdentitySyncService, useClass: MobileIdentitySyncService },
      { provide: CONSENT_SERVICE, useClass: ConsentService },
      { provide: OFFLINE_QUEUE, useClass: MobileOfflineQueueService },
    ];

    return {
      module: MobileTrackingModule,
      global: true,
      providers,
      exports: [
        TRACKING_SERVICE,
        TRACKING_CONFIG,
        CONSENT_SERVICE,
        OFFLINE_QUEUE,
        NativeSdkService,
        MobileIdentitySyncService,
      ],
    };
  }
}
