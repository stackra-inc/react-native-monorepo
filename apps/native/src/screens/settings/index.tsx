/**
 * Settings Screen
 *
 * App settings including theme switching and app info.
 * Uses Uniwind's theme API for runtime theme changes.
 *
 * @module screens/settings
 */

import { Str } from "@stackra/ts-support";
import { Button, Card, Alert, useThemeColor } from "heroui-native";
import { View, Text, ScrollView } from "react-native";
import { Uniwind, useUniwind } from "uniwind";
import type { UniwindConfig } from "uniwind";

/** All available theme names derived from the Uniwind config */
type ThemeName = UniwindConfig["themes"][number];

/** Map of theme base names to their light/dark variants */
const THEME_TOGGLE_MAP: Record<string, [light: ThemeName, dark: ThemeName]> = {
  default: ["light", "dark"],
  lavender: ["lavender-light", "lavender-dark"],
  mint: ["mint-light", "mint-dark"],
  sky: ["sky-light", "sky-dark"],
};

export function SettingsScreen() {
  const { theme } = useUniwind();

  /**
   * Toggle between light and dark variants of the current theme.
   */
  const handleToggleTheme = (): void => {
    for (const [, [light, dark]] of Object.entries(THEME_TOGGLE_MAP)) {
      if (theme === light) {
        Uniwind.setTheme(dark);
        return;
      }
      if (theme === dark) {
        Uniwind.setTheme(light);
        return;
      }
    }
    // Fallback
    Uniwind.setTheme("dark");
  };

  /**
   * Switch to a named theme.
   *
   * @param name - The theme name to activate
   */
  const handleSetTheme = (name: ThemeName): void => {
    Uniwind.setTheme(name);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-4 pt-safe-offset-4 pb-safe-offset-6 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-semibold text-foreground">Settings</Text>

        {/* Current Theme */}
        <Alert status="accent" className="items-center">
          <Alert.Indicator className="pt-0" />
          <Alert.Content>
            <Alert.Title>Current theme: {Str.title(theme)}</Alert.Title>
          </Alert.Content>
        </Alert>

        {/* Theme Toggle */}
        <Card>
          <Card.Body className="gap-3">
            <Card.Title>Appearance</Card.Title>
            <Card.Description>Toggle between light and dark mode</Card.Description>
            <Button variant="secondary" onPress={handleToggleTheme}>
              Toggle Dark Mode
            </Button>
          </Card.Body>
        </Card>

        {/* Theme Selector */}
        <Card>
          <Card.Body className="gap-3">
            <Card.Title>Themes</Card.Title>
            <Card.Description>Choose a custom theme</Card.Description>
            <View className="gap-2">
              <Button variant="primary" onPress={() => handleSetTheme("light")}>
                Default
              </Button>
              <Button variant="secondary" onPress={() => handleSetTheme("lavender-light")}>
                Lavender
              </Button>
              <Button variant="secondary" onPress={() => handleSetTheme("mint-light")}>
                Mint
              </Button>
              <Button variant="secondary" onPress={() => handleSetTheme("sky-light")}>
                Sky
              </Button>
            </View>
          </Card.Body>
        </Card>

        {/* App Info */}
        <Card variant="tertiary">
          <Card.Body>
            <Card.Title>About</Card.Title>
            <Card.Description>
              HeroUI Native Template v1.0.0{"\n"}
              Expo 55 · React Native 0.83 · Turborepo
            </Card.Description>
          </Card.Body>
        </Card>
      </ScrollView>
    </View>
  );
}
