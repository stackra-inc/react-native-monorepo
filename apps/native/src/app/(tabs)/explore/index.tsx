/**
 * Explore Tab Route
 *
 * Thin route wrapper — delegates all UI to the ExploreScreen component.
 * The native Stack header is configured via `Stack.Screen` options.
 *
 * @module app/(tabs)/explore/index
 */

import { Stack } from "expo-router";

import { ExploreScreen } from "@/screens/explore";

export default function ExploreRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Explore" }} />
      <ExploreScreen />
    </>
  );
}
