import "../global.css";

import { HeroUINativeProvider } from "heroui-native";
import type { HeroUINativeConfig } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";

const config: HeroUINativeConfig = {
  textProps: {
    allowFontScaling: true,
    maxFontSizeMultiplier: 1.5,
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider config={config}>
        <Stack />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
