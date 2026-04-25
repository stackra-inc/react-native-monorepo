/**
 * Tab Navigation Layout — Native Tabs
 *
 * Uses `NativeTabs` from Expo Router for platform-native tab bar rendering.
 * On iOS 26+ (compiled with Xcode 26), the tab bar automatically renders
 * with Apple's Liquid Glass material. On older iOS and Android, it falls
 * back to the standard native tab bar.
 *
 * Each tab is a folder containing a `_layout.tsx` with a native Stack
 * navigator, which gives each tab its own navigation header (also
 * rendered with Liquid Glass on iOS 26+).
 *
 * @see https://docs.expo.dev/router/advanced/native-tabs/
 *
 * @module app/(tabs)/_layout
 */

import { NativeTabs } from "expo-router/unstable-native-tabs";

/**
 * Native tab layout with Liquid Glass support.
 *
 * Renders three tabs: Home, Explore, and Settings. The tab bar
 * appearance is fully managed by the native platform — no custom
 * styling needed. Liquid Glass is applied automatically on iOS 26+.
 *
 * @returns The native tab navigator layout.
 */
export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Icon sf={{ default: "safari", selected: "safari.fill" }} md="explore" />
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md="settings"
        />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
