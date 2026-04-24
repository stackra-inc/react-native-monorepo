/**
 * Root Layout
 *
 * The top-level layout that wraps the entire application. Responsible for:
 * - Loading custom fonts (Inter family)
 * - Bootstrapping the DI container
 * - Providing GestureHandler, Keyboard, DI, and HeroUI contexts
 * - Managing the splash screen lifecycle
 *
 * This file should stay thin — all provider config is defined as constants
 * outside the component to avoid re-creation on each render.
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
import { HeroUINativeProvider } from "heroui-native";
import type { HeroUINativeConfig } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardAvoidingView, KeyboardProvider } from "react-native-keyboard-controller";

import "@/styles/global.css";
import { bootstrap } from "@/bootstrap";

// ── Splash Screen ───────────────────────────────────────────────────────────

SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

// ── HeroUI Configuration ────────────────────────────────────────────────────

/**
 * Global HeroUI Native provider configuration.
 *
 * Defined outside the component to prevent object re-creation on each render.
 * The `contentWrapper` for toast is created inside AppContent via useCallback
 * since it uses JSX.
 */
const heroUiConfig: Omit<HeroUINativeConfig, "toast"> = {
  textProps: {
    allowFontScaling: true,
    maxFontSizeMultiplier: 2,
  },
  devInfo: {
    stylingPrinciples: false,
  },
};

// ── Inner Content ───────────────────────────────────────────────────────────

/**
 * Inner app content wrapped with DI container and HeroUI provider.
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
    ...heroUiConfig,
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
  };

  return (
    <ContainerProvider>
      <HeroUINativeProvider config={config}>
        <Slot />
      </HeroUINativeProvider>
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
    bootstrap().then(() => setIsReady(true));
  }, []);

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
