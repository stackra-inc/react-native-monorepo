import "../global.css";

import { bootstrap } from "@/bootstrap";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { ContainerProvider } from "@stackra/ts-container";
import { Slot, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { HeroUINativeConfig } from "heroui-native";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Keep splash screen visible while we bootstrap
SplashScreen.preventAutoHideAsync();

const config: HeroUINativeConfig = {
  textProps: {
    allowFontScaling: true,
    maxFontSizeMultiplier: 1.5,
  },
  devInfo: {
    stylingPrinciples: false,
  },
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    bootstrap()
      .then(() => setIsReady(true))
      .then(() => SplashScreen.hideAsync());
  }, []);

  if (!isReady) {
    return null;
  }

  // Application.create() sets the global instance automatically.
  // ContainerProvider without context prop picks it up — same as
  // the Vite pattern where main.tsx bootstraps and App.tsx uses the provider.
  return (
    <ContainerProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppThemeProvider>
          <HeroUINativeProvider config={config}>
            <Slot />
            <StatusBar style="auto" />
          </HeroUINativeProvider>
        </AppThemeProvider>
      </GestureHandlerRootView>
    </ContainerProvider>
  );
}
