/**
 * Home Tab Route
 *
 * Thin route wrapper — delegates all UI to the HomeScreen component.
 * The native Stack header is configured via `Stack.Screen` options.
 *
 * @module app/(tabs)/home/index
 */

import { Stack } from "expo-router";

import { HomeScreen } from "@/screens/home";

export default function HomeRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Home" }} />
      <HomeScreen />
    </>
  );
}
