/**
 * @fileoverview MobileTrackingContext — React context for mobile tracking services.
 *
 * Provides access to the {@link IMobileTrackingService} and
 * {@link ConsentService} throughout the React Native component tree.
 * Consumed by the `useTracking` and `useConsent` hooks, populated
 * by the `MobileTrackingProvider`.
 *
 * @module @stackra/react-native-tracking
 * @category Contexts
 */

import { createContext } from "react";

import type { IMobileTrackingService } from "@/interfaces/tracking-service.interface";
import type { ConsentService } from "@/services/consent.service";

/**
 * Shape of the mobile tracking context value.
 *
 * Contains the mobile tracking service instance and consent service
 * for dispatching engagement events and managing consent state.
 */
export interface MobileTrackingContextValue {
  /**
   * The mobile tracking service instance for dispatching engagement events.
   * `null` when the provider has not yet initialized.
   */
  trackingService: IMobileTrackingService | null;

  /**
   * The consent service instance for managing user consent state.
   * `null` when the provider has not yet initialized.
   */
  consentService: ConsentService | null;
}

/**
 * MobileTrackingContext — React context for mobile engagement tracking.
 *
 * Defaults to `null` for all services. Must be wrapped in a
 * `MobileTrackingProvider` to function.
 *
 * @example
 * ```typescript
 * const { trackingService, consentService } = useContext(MobileTrackingContext);
 * trackingService?.trackScreenView('HomeScreen');
 * ```
 */
export const MobileTrackingContext = createContext<MobileTrackingContextValue>({
  trackingService: null,
  consentService: null,
});
