/**
 * Home Tab Route
 *
 * Thin route wrapper — delegates all UI to the HomeScreen component.
 *
 * @module app/(tabs)/index
 */

import { HomeScreen } from "@/screens/home";

export default function HomeRoute() {
  return <HomeScreen />;
}
