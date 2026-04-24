/**
 * Settings Tab Route
 *
 * Thin route wrapper — delegates all UI to the SettingsScreen component.
 *
 * @module app/(tabs)/settings
 */

import { SettingsScreen } from "@/screens/settings";

export default function SettingsRoute() {
  return <SettingsScreen />;
}
