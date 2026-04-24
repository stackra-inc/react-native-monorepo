/**
 * Root Layout
 *
 * The top-level layout that wraps the entire application. Responsible for:
 * - Loading custom fonts (Inter family)
 * - Bootstrapping the DI container
 * - Providing GestureHandler, Keyboard, DI, and UI contexts
 * - Managing the splash screen lifecycle
 *
 * Uses `UIProvider` from `@repo/ui` as the single entry point for all
 * UI providers (HeroUINativeProvider + ThemeProvider).
 *
 * @module app/_layout
 */

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { ContainerProvider } from "@stackra/ts-container";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardAvoidingView, KeyboardProvider } from "react-native-keyboard-controller";

import { UIProvider } from "@repo/ui";
import type { HeroUINativeConfig } from "@repo/ui";
import "@/styles/global.css";
import { bootstrap } from "@/bootstrap";

// ── Splash Screen ───────────────────────────────────────────────────────────

SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

// ── Inner Content ───────────────────────────────────────────────────────────

/**
 * Inner app content wrapped with DI container and UIProvider.
 *
 * Separated from RootLayout so the toast contentWrapper can use useCallback
 * without triggering font/bootstrap re-checks.
 */
function AppContent() {
  const contentWrapper = useCallback(
    (children: React.ReactNode) => (
      <KeyboardAvoidingView
        pointerEvents="box-none"
        behavior="padding"
        keyboardVerticalOffset={12}
        className="flex-1"
      >
        {children}
      </KeyboardAvoidingView>
    ),
    [],
  );

  const config: HeroUINativeConfig = {
    textProps: {
      allowFontScaling: true,
      maxFontSizeMultiplier: 2,
    },
    toast: {
      contentWrapper,
      defaultProps: {
        variant: "default",
        placement: "top",
        isSwipeable: true,
        animation: true,
      },
      insets: { top: 0, bottom: 6, left: 12, right: 12 },
      maxVisibleToasts: 3,
    },
    devInfo: {
      stylingPrinciples: false,
    },
  };

  return (
    <ContainerProvider>
      <UIProvider config={config}>
        <Slot />
      </UIProvider>
    </ContainerProvider>
  );
}

// ── Root Layout ─────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    console.log("[RootLayout] useEffect: calling bootstrap()...");
    bootstrap().then(() => {
      console.log("[RootLayout] bootstrap resolved, setting isReady=true");
      setIsReady(true);
    });
  }, []);

  console.log("[RootLayout] render — fontsLoaded:", fontsLoaded, "isReady:", isReady);

  if (!fontsLoaded || !isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <AppContent />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
