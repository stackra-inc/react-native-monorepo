/**
 * @fileoverview useTracking hook — access mobile tracking methods from context.
 *
 * Provides a convenient way to access the {@link IMobileTrackingService}
 * from the nearest {@link MobileTrackingProvider}.
 *
 * @module @stackra/react-native-tracking
 * @category Hooks
 */

import { useContext } from "react";

import { MobileTrackingContext } from "@/contexts/tracking.context";
import type { MobileTrackingContextValue } from "@/contexts/tracking.context";

/**
 * Access mobile tracking methods from the nearest MobileTrackingProvider.
 *
 * Returns the mobile tracking service instance for dispatching engagement
 * events (app open, screen view, deep link, push notification open).
 *
 * @returns The mobile tracking context value containing the service instance.
 * @throws When used outside of a MobileTrackingProvider (returns default null values).
 *
 * @example
 * ```tsx
 * function HomeScreen() {
 *   const { trackingService } = useTracking();
 *
 *   useEffect(() => {
 *     trackingService?.trackScreenView('HomeScreen');
 *   }, [trackingService]);
 *
 *   return <View><Text>Home</Text></View>;
 * }
 * ```
 */
export function useTracking(): MobileTrackingContextValue {
  return useContext(MobileTrackingContext);
}
