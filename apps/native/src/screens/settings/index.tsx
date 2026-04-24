/**
 * Settings Screen
 *
 * App settings including theme switching and app info.
 * Delegates theme management to the DI-driven ThemeService
 * via `useAppTheme` and the `ThemeSwitcher` component.
 *
 * @module screens/settings
 */

import { Str } from "@stackra/ts-support";
import { Card, Alert, Button } from "@repo/ui";
import { useAppTheme, ThemeSwitcher } from "@repo/ui";
import { View, Text, ScrollView } from "react-native";

/**
 * Settings screen component.
 *
 * Displays the current theme, a toggle for light/dark mode,
 * a data-driven theme switcher, and app info.
 *
 * @returns The settings screen UI.
 */
export function SettingsScreen() {
  const { currentTheme, toggleTheme } = useAppTheme();

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
            <Alert.Title>Current theme: {Str.title(currentTheme)}</Alert.Title>
          </Alert.Content>
        </Alert>

        {/* Theme Toggle */}
        <Card>
          <Card.Body className="gap-3">
            <Card.Title>Appearance</Card.Title>
            <Card.Description>Toggle between light and dark mode</Card.Description>
            <Button variant="secondary" onPress={toggleTheme}>
              Toggle Dark Mode
            </Button>
          </Card.Body>
        </Card>

        {/* Theme Selector — data-driven from ThemeRegistry */}
        <Card>
          <Card.Body className="gap-3">
            <Card.Title>Themes</Card.Title>
            <Card.Description>Choose a custom theme</Card.Description>
            <ThemeSwitcher />
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
