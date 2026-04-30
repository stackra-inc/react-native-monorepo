/**
 * @fileoverview ConsentService — manages user consent state for mobile tracking.
 *
 * Stores per-category consent state (analytics, marketing, functional) and
 * gates all tracking operations based on consent status. Syncs consent
 * changes to the backend via the tracking context endpoint.
 *
 * All categories default to `false` (denied) until explicitly granted —
 * the strictest GDPR-compliant default.
 *
 * Same public API as the frontend ConsentService for cross-platform consistency.
 *
 * @module @stackra/react-native-tracking
 * @category Services
 */

import { Injectable, Inject } from "@stackra/ts-container";
import { HTTP_CLIENT } from "@stackra/ts-http";
import type { HttpClient } from "@stackra/ts-http";

import { TRACKING_CONFIG } from "@/constants/tokens.constant";
import { ConsentCategory } from "@/enums/consent-category.enum";
import type { ConsentState } from "@/interfaces/consent-state.interface";
import type { MobileTrackingConfig } from "@/interfaces/tracking-config.interface";

/**
 * ConsentService — DI-managed singleton for mobile user consent state.
 *
 * Manages per-category consent and notifies subscribers on changes.
 * Services can check consent directly; React Native components use
 * the `useConsent` hook which subscribes to changes.
 *
 * @example
 * ```typescript
 * const consent = container.get<ConsentService>(CONSENT_SERVICE);
 * consent.grantConsent(ConsentCategory.MARKETING);
 * consent.hasConsent(ConsentCategory.MARKETING); // true
 * ```
 */
@Injectable()
export class ConsentService {
  /**
   * Current consent state — all categories default to `false`.
   */
  private state: ConsentState = {
    [ConsentCategory.ANALYTICS]: false,
    [ConsentCategory.MARKETING]: false,
    [ConsentCategory.FUNCTIONAL]: false,
  };

  /**
   * Set of listener callbacks notified on consent state changes.
   */
  private readonly listeners: Set<() => void> = new Set();

  /**
   * Create a new ConsentService instance.
   *
   * @param http - The HTTP client for syncing consent to the backend.
   * @param config - The mobile tracking configuration with API base URL.
   */
  public constructor(
    @Inject(HTTP_CLIENT) private readonly http: HttpClient,
    @Inject(TRACKING_CONFIG) private readonly config: MobileTrackingConfig,
  ) {}

  /**
   * Grant consent for a specific category.
   *
   * Sets the category to `true`, notifies subscribers, and syncs
   * the updated state to the backend.
   *
   * @param category - The consent category to grant.
   * @returns void
   */
  public grantConsent(category: ConsentCategory): void {
    this.state[category] = true;
    this.notifyListeners();
    this.syncToBackend();
  }

  /**
   * Revoke consent for a specific category.
   *
   * Sets the category to `false`, notifies subscribers, and syncs
   * the updated state to the backend.
   *
   * @param category - The consent category to revoke.
   * @returns void
   */
  public revokeConsent(category: ConsentCategory): void {
    this.state[category] = false;
    this.notifyListeners();
    this.syncToBackend();
  }

  /**
   * Check whether consent is granted for a specific category.
   *
   * @param category - The consent category to check.
   * @returns `true` if consent is granted for the category.
   */
  public hasConsent(category: ConsentCategory): boolean {
    return this.state[category];
  }

  /**
   * Replace the entire consent state at once.
   *
   * Useful for restoring consent from a consent management platform.
   * Notifies subscribers and syncs to the backend.
   *
   * @param state - The new consent state mapping.
   * @returns void
   */
  public updateConsent(state: ConsentState): void {
    this.state = { ...state };
    this.notifyListeners();
    this.syncToBackend();
  }

  /**
   * Get the current consent state.
   *
   * Returns a shallow copy to prevent external mutation.
   *
   * @returns The current consent state mapping.
   */
  public getState(): ConsentState {
    return { ...this.state };
  }

  /**
   * Subscribe to consent state changes.
   *
   * The listener is called whenever consent state changes. Returns
   * an unsubscribe function. Used by the `useConsent` hook.
   *
   * @param listener - Callback invoked on consent state change.
   * @returns An unsubscribe function that removes the listener.
   *
   * @example
   * ```typescript
   * const unsubscribe = consent.subscribe(() => {
   *   console.log('Consent changed:', consent.getState());
   * });
   * unsubscribe();
   * ```
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  // ── Private Helpers ───────────────────────────────────────────────

  /**
   * Notify all subscribed listeners of a consent state change.
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Sync the current consent state to the backend.
   *
   * POSTs the consent mapping to the tracking context endpoint.
   * Failures are silently swallowed — consent state is authoritative
   * on the client side.
   */
  private syncToBackend(): void {
    const endpoint = `${this.config.apiBaseUrl}/tracking/context`;

    this.http.post(endpoint, { consent: this.state }).catch(() => {
      // Sync failure is non-critical — client state is authoritative
    });
  }
}
