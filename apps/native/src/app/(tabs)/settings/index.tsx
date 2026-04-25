/**
 * Settings Tab Route
 *
 * Thin route wrapper — delegates all UI to the SettingsScreen component.
 * The native Stack header is configured via `Stack.Screen` options.
 *
 * @module app/(tabs)/settings/index
 */

import { Stack } from "expo-router";

import { SettingsScreen } from "@/screens/settings";

export default function SettingsRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Settings" }} />
      <SettingsScreen />
    </>
  );
}
