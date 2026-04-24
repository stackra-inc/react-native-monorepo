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
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from "react-native-keyboard-controller";
import "../styles/global.css";
import { bootstrap } from "../bootstrap";

SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

/**
 * Inner app content wrapped with HeroUI provider and keyboard handling.
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
      insets: {
        top: 0,
        bottom: 6,
        left: 12,
        right: 12,
      },
      maxVisibleToasts: 3,
    },
    devInfo: {
      stylingPrinciples: false,
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
  root: {
    flex: 1,
  },
});
