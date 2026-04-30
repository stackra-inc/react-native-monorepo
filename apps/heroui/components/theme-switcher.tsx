import { Ionicons } from "@expo/vector-icons";
import { Button, Card, useThemeColor } from "heroui-native";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ThemeTransitionPreset, Uniwind, useUniwind } from "uniwind";

const THEMES = [
  { name: "light", label: "Light", icon: "sunny-outline" as const },
  { name: "dark", label: "Dark", icon: "moon-outline" as const },
  { name: "system", label: "System", icon: "phone-portrait-outline" as const },
] as const;

const TRANSITIONS = [
  {
    preset: ThemeTransitionPreset.Fade,
    label: "Fade",
    icon: "eye-outline" as const,
  },
  {
    preset: ThemeTransitionPreset.CircleCenter,
    label: "Circle",
    icon: "radio-button-on-outline" as const,
  },
  {
    preset: ThemeTransitionPreset.SlideRightToLeft,
    label: "Slide",
    icon: "arrow-back-outline" as const,
  },
  {
    preset: ThemeTransitionPreset.Blur,
    label: "Blur",
    icon: "water-outline" as const,
  },
  {
    preset: ThemeTransitionPreset.CircleTopRight,
    label: "Top Right",
    icon: "resize-outline" as const,
  },
  {
    preset: ThemeTransitionPreset.BlurLeftToRight,
    label: "Blur Slide",
    icon: "swap-horizontal-outline" as const,
  },
] as const;

export function ThemeSwitcher() {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const activeTheme = hasAdaptiveThemes ? "system" : theme;
  const [selectedTransition, setSelectedTransition] = useState(TRANSITIONS[0]);

  const [accentFg, foreground, muted] = useThemeColor([
    "accent-foreground",
    "foreground",
    "muted",
  ]);

  const switchTheme = (themeName: string) => {
    if (themeName === "system") {
      Uniwind.setTheme("system");
    } else {
      Uniwind.setTheme(themeName, { preset: selectedTransition.preset });
    }
  };

  return (
    <View className="gap-5">
      {/* Current Theme Display */}
      <Card>
        <Card.Body className="items-center gap-2">
          <Text className="text-4xl">
            {activeTheme === "dark"
              ? "🌙"
              : activeTheme === "light"
                ? "☀️"
                : "⚙️"}
          </Text>
          <Card.Title className="text-center text-lg">
            {activeTheme.charAt(0).toUpperCase() + activeTheme.slice(1)} Theme
          </Card.Title>
          <Card.Description className="text-center">
            {hasAdaptiveThemes
              ? "Following system preference"
              : `Fixed to ${theme} mode`}
          </Card.Description>
        </Card.Body>
      </Card>

      {/* Theme Selector */}
      <View className="gap-2">
        <Text className="text-sm font-medium text-muted">Theme</Text>
        <View className="flex-row gap-3">
          {THEMES.map((t) => {
            const isActive = activeTheme === t.name;
            return (
              <Button
                key={t.name}
                variant={isActive ? "primary" : "secondary"}
                className="flex-1"
                onPress={() => switchTheme(t.name)}
              >
                <Ionicons
                  name={t.icon}
                  size={18}
                  color={isActive ? accentFg : foreground}
                />
                <Button.Label>{t.label}</Button.Label>
              </Button>
            );
          })}
        </View>
      </View>

      {/* Transition Selector (Pro feature) */}
      <View className="gap-2">
        <Text className="text-sm font-medium text-muted">
          Transition Effect (Uniwind Pro)
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {TRANSITIONS.map((t) => {
            const isActive = selectedTransition.preset === t.preset;
            return (
              <Pressable
                key={t.label}
                onPress={() => setSelectedTransition(t)}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl ${
                  isActive ? "bg-accent" : "bg-default"
                }`}
              >
                <Ionicons
                  name={t.icon}
                  size={14}
                  color={isActive ? accentFg : muted}
                />
                <Text
                  className={`text-sm ${
                    isActive
                      ? "text-accent-foreground font-medium"
                      : "text-muted"
                  }`}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Quick Toggle */}
      <Button
        variant="tertiary"
        onPress={() => {
          const next = theme === "dark" ? "light" : "dark";
          Uniwind.setTheme(next, { preset: selectedTransition.preset });
        }}
      >
        <Ionicons name="contrast-outline" size={18} color={foreground} />
        <Button.Label>
          Toggle with {selectedTransition.label} Transition
        </Button.Label>
      </Button>
    </View>
  );
}
