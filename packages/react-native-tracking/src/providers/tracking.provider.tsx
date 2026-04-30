/**
 * @fileoverview MobileTrackingProvider — React context provider for mobile engagement tracking.
 *
 * Initializes native SDKs via {@link NativeSdkService} (consent-gated),
 * starts identity sync via {@link MobileIdentitySyncService} (consent-gated),
 * and listens for AppState changes to fire AppOpen events on foreground
 * transitions. Exposes tracking methods and consent service to the
 * component tree via {@link MobileTrackingContext}.
 *
 * @module @stackra/react-native-tracking
 * @category Providers
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { AppState } from "react-native";
import type { AppStateStatus } from "react-native";

import { MobileTrackingContext } from "@/contexts/tracking.context";
import type { MobileTrackingContextValue } from "@/contexts/tracking.context";
import type { IMobileTrackingService } from "@/interfaces/tracking-service.interface";
import type { NativeSdkService } from "@/services/native-sdk.service";
import type { MobileIdentitySyncService } from "@/services/identity-sync.service";
import type { ConsentService } from "@/services/consent.service";

/**
 * Props for the {@link MobileTrackingProvider} component.
 */
export interface MobileTrackingProviderProps {
  /** The child components to render within the tracking context. */
  children: ReactNode;

  /** The mobile tracking service instance resolved from the DI container. */
  trackingService: IMobileTrackingService;

  /** The native SDK service instance resolved from the DI container. */
  nativeSdk: NativeSdkService;

  /** The identity sync service instance resolved from the DI container. */
  identitySync: MobileIdentitySyncService;

  /** The consent service instance resolved from the DI container. */
  consentService: ConsentService;
}

/**
 * MobileTrackingProvider — initializes mobile tracking infrastructure and provides context.
 *
 * On mount:
 * 1. Initializes configured native SDKs (consent-gated — skips if marketing consent denied)
 * 2. Starts device identity sync with the backend (consent-gated — skips if analytics consent denied)
 * 3. Sets up an AppState listener to fire AppOpen events on foreground transitions
 * 4. Subscribes to consent changes to re-attempt initialization when consent is granted
 *
 * On unmount:
 * 1. Removes the AppState listener
 * 2. Unsubscribes from consent changes
 *
 * @example
 * ```tsx
 * <MobileTrackingProvider
 *   trackingService={trackingSvc}
 *   nativeSdk={nativeSdkSvc}
 *   identitySync={identitySyncSvc}
 *   consentService={consentSvc}
 * >
 *   <App />
 * </MobileTrackingProvider>
 * ```
 */
export function MobileTrackingProvider({
  children,
  trackingService,
  nativeSdk,
  identitySync,
  consentService,
}: MobileTrackingProviderProps): React.JSX.Element {
  const [ready, setReady] = useState<boolean>(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ── Initialize native SDKs and identity sync on mount ─────────────

  useEffect(() => {
    const init = async (): Promise<void> => {
      // NativeSdkService.initialize() checks marketing consent internally
      await nativeSdk.initialize();
      // MobileIdentitySyncService.start() checks analytics consent internally
      await identitySync.start();
      setReady(true);
    };

    init();

    // Re-attempt initialization when consent changes
    const unsubscribe = consentService.subscribe(() => {
      nativeSdk.initialize();
      identitySync.start();
    });

    return () => {
      unsubscribe();
    };
  }, [nativeSdk, identitySync, consentService]);

  // ── Listen for AppState changes (background → active = AppOpen) ───

  const handleAppStateChange = useCallback(
    (nextState: AppStateStatus): void => {
      if (appStateRef.current.match(/inactive|background/) && nextState === "active") {
        trackingService.trackAppOpen();
      }

      appStateRef.current = nextState;
    },
    [trackingService],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  // ── Build context value ───────────────────────────────────────────

  const contextValue: MobileTrackingContextValue = useMemo(
    () => ({
      trackingService: ready ? trackingService : null,
      consentService,
    }),
    [ready, trackingService, consentService],
  );

  return (
    <MobileTrackingContext.Provider value={contextValue}>{children}</MobileTrackingContext.Provider>
  );
}
