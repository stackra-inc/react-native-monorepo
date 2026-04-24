/**
 * Tab Navigation Layout
 *
 * Defines the bottom tab navigator for the main app experience.
 * Each tab renders a thin route file that delegates to a screen component
 * in `@/screens/`.
 *
 * @module app/(tabs)/_layout
 */

import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Platform } from "react-native";

export default function TabLayout() {
  const [foreground, background, accent, muted] = useThemeColor([
    "foreground",
    "background",
    "accent",
    "muted",
  ]);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        headerTintColor: foreground,
        headerStyle: {
          backgroundColor: background,
        },
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: muted,
        tabBarStyle: {
          backgroundColor: background,
          borderTopWidth: 0,
          ...Platform.select({
            ios: {
              position: "absolute" as const,
            },
            android: {},
          }),
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarLabel: "Explore",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
        }}
      />
    </Tabs>
  );
}
