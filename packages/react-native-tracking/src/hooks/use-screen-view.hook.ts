/**
 * @fileoverview useScreenView hook — fires ScreenView on React Navigation screen focus.
 *
 * Listens for screen focus events from React Navigation and dispatches
 * a ScreenView event via the mobile tracking service. Requires the
 * component to be rendered within a {@link MobileTrackingProvider} and
 * a React Navigation `NavigationContainer`.
 *
 * @module @stackra/react-native-tracking
 * @category Hooks
 */

import { useEffect, useRef } from "react";
import type { NavigationContainerRef } from "@react-navigation/native";

import { useTracking } from "@/hooks/use-tracking.hook";

/**
 * Fire a ScreenView event on React Navigation screen focus changes.
 *
 * Attaches a listener to the navigation container ref that fires
 * a ScreenView event each time a screen gains focus. Tracks the
 * previous route to avoid duplicate events on re-renders.
 *
 * @param navigationRef - A ref to the React Navigation `NavigationContainer`.
 * @returns void
 *
 * @example
 * ```tsx
 * function App() {
 *   const navigationRef = useNavigationContainerRef();
 *   useScreenView(navigationRef);
 *
 *   return (
 *     <NavigationContainer ref={navigationRef}>
 *       <Stack.Navigator>
 *         <Stack.Screen name="Home" component={HomeScreen} />
 *       </Stack.Navigator>
 *     </NavigationContainer>
 *   );
 * }
 * ```
 */
export function useScreenView(navigationRef: NavigationContainerRef<any>): void {
  const { trackingService } = useTracking();
  const previousRouteRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!navigationRef || !trackingService) return;

    const unsubscribe = navigationRef.addListener("state", () => {
      const currentRoute = navigationRef.getCurrentRoute();
      const currentRouteName = currentRoute?.name;

      // Skip if the route hasn't changed
      if (currentRouteName === previousRouteRef.current) return;

      previousRouteRef.current = currentRouteName;

      if (currentRouteName) {
        trackingService.trackScreenView(currentRouteName);
      }
    });

    return unsubscribe;
  }, [navigationRef, trackingService]);
}
