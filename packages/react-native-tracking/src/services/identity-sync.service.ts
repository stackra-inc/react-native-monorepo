/**
 * @fileoverview MobileIdentitySyncService — synchronizes device advertising IDs with the backend.
 *
 * Retrieves IDFA (iOS) via `react-native-tracking-transparency` +
 * `react-native-idfa-aaid`, and GAID (Android) via `react-native-idfa-aaid`.
 * Respects ATT consent — omits IDFA if the user has denied tracking permission.
 * POSTs the device identifiers to the `/api/tracking/context` endpoint.
 *
 * @module @stackra/react-native-tracking
 * @category Services
 */

import { Injectable, Inject } from "@stackra/ts-container";
import { HTTP_CLIENT } from "@stackra/ts-http";
import type { HttpClient } from "@stackra/ts-http";

import { TRACKING_CONFIG, CONSENT_SERVICE } from "@/constants/tokens.constant";
import { ConsentCategory } from "@/enums/consent-category.enum";
import type { MobileTrackingConfig } from "@/interfaces/tracking-config.interface";
import type { ConsentService } from "@/services/consent.service";

/**
 * MobileIdentitySyncService — retrieves device IDs and syncs with the backend.
 *
 * On initialization, checks ATT consent status (iOS), retrieves the
 * appropriate device advertising identifier (IDFA or GAID), and POSTs
 * it to the backend tracking context endpoint. Re-syncs can be triggered
 * manually if needed.
 *
 * @example
 * ```typescript
 * const sync = container.get(MobileIdentitySyncService);
 * await sync.start();  // retrieves IDs and syncs
 * ```
 */
@Injectable()
export class MobileIdentitySyncService {
  /** Whether a sync has already been performed. */
  private synced: boolean = false;

  /**
   * Create a new MobileIdentitySyncService instance.
   *
   * @param config - The mobile tracking configuration injected via DI.
   * @param http - The HTTP client for API requests.
   * @param consent - The consent service for checking analytics consent.
   */
  public constructor(
    @Inject(TRACKING_CONFIG) private readonly config: MobileTrackingConfig,
    @Inject(HTTP_CLIENT) private readonly http: HttpClient,
    @Inject(CONSENT_SERVICE) private readonly consent: ConsentService,
  ) {}

  /**
   * Start the identity sync process.
   *
   * Retrieves the device advertising identifier (IDFA on iOS, GAID on
   * Android), respecting ATT consent, and POSTs it to the backend
   * tracking context endpoint.
   *
   * Safe to call multiple times — subsequent calls are no-ops unless
   * `force` is true.
   *
   * @param force - Whether to force a re-sync even if already synced.
   * @returns A promise that resolves when the sync is complete.
   */
  public async start(force: boolean = false): Promise<void> {
    if (this.synced && !force) return;
    if (!this.consent.hasConsent(ConsentCategory.ANALYTICS)) return;

    const tokens = await this.retrieveDeviceIds();

    // Skip if no identity tokens are available
    if (!tokens.idfa && !tokens.gaid) return;

    const endpoint = `${this.config.apiBaseUrl}/tracking/context`;

    try {
      await this.http.post(endpoint, tokens);
      this.synced = true;
    } catch {
      // Reset synced flag so we retry on next call
      this.synced = false;
    }
  }

  // ── Private Helpers ───────────────────────────────────────────────

  /**
   * Retrieve device advertising identifiers.
   *
   * On iOS, checks ATT consent via `react-native-tracking-transparency`
   * before retrieving the IDFA. On Android, retrieves the GAID directly.
   * Both use `react-native-idfa-aaid` for the actual ID retrieval.
   *
   * @returns An object containing the available device identifiers.
   */
  private async retrieveDeviceIds(): Promise<{ idfa?: string; gaid?: string }> {
    const result: { idfa?: string; gaid?: string } = {};

    // Attempt to get IDFA (iOS) — respects ATT consent
    try {
      const { getTrackingStatus } = await import("react-native-tracking-transparency");
      const status = await getTrackingStatus();

      if (status === "authorized") {
        const { getAdvertisingId } = await this.importIdfaModule();
        const adId = await getAdvertisingId();

        if (adId) {
          result.idfa = adId;
        }
      }
    } catch {
      // Tracking transparency not available — try GAID fallback
    }

    // Attempt to get GAID (Android) if no IDFA was retrieved
    if (!result.idfa) {
      try {
        const { getAdvertisingId } = await this.importIdfaModule();
        const adId = await getAdvertisingId();

        if (adId) {
          result.gaid = adId;
        }
      } catch {
        // IDFA/AAID module not available — skip silently
      }
    }

    return result;
  }

  /**
   * Dynamically import the IDFA/AAID module.
   *
   * Isolates the dynamic import for testability and to handle
   * the optional peer dependency gracefully.
   *
   * @returns The imported `react-native-idfa-aaid` module.
   */
  private async importIdfaModule(): Promise<{ getAdvertisingId: () => Promise<string | null> }> {
    const module = await import("react-native-idfa-aaid");
    return {
      getAdvertisingId: () =>
        module.default.getAdvertisingInfo().then((info: { id: string | null }) => info.id),
    };
  }
}
