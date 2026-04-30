import { ThemeToggle } from "@/components/theme-toggle";
import { useAppTheme } from "@/contexts/app-theme-context";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useThemeColor } from "heroui-native";
import { useCallback, useMemo } from "react";
import { Platform, View } from "react-native";

export default function TabLayout() {
  const { isDark } = useAppTheme();
  const [foreground, background] = useThemeColor(["foreground", "background"]);

  const renderThemeToggle = useCallback(() => <ThemeToggle />, []);

  const isLG = isLiquidGlassAvailable();

  const screenOptions = useMemo(
    () => ({
      headerTitleAlign: "center" as const,
      headerTransparent: true,
      headerBlurEffect: (isDark ? "dark" : "light") as "dark" | "light",
      headerTintColor: foreground,
      headerStyle: {
        backgroundColor: Platform.select({
          ios: undefined,
          android: background,
        }),
      },
      headerRight: renderThemeToggle,
      contentStyle: {
        backgroundColor: background,
      },
    }),
    [isDark, foreground, background, renderThemeToggle],
  );

  return (
    <View className="flex-1 bg-background">
      <NativeTabs screenOptions={screenOptions}>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf="house.fill" />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="components">
          <NativeTabs.Trigger.Icon sf="square.grid.2x2.fill" />
          <NativeTabs.Trigger.Label>Components</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="forms">
          <NativeTabs.Trigger.Icon sf="pencil.and.list.clipboard" />
          <NativeTabs.Trigger.Label>Forms</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="explore">
          <NativeTabs.Trigger.Icon sf="safari.fill" />
          <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="services">
          <NativeTabs.Trigger.Icon sf="gearshape.2.fill" />
          <NativeTabs.Trigger.Label>Services</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="support">
          <NativeTabs.Trigger.Icon sf="wrench.and.screwdriver.fill" />
          <NativeTabs.Trigger.Label>Support</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="redis">
          <NativeTabs.Trigger.Icon sf="server.rack" />
          <NativeTabs.Trigger.Label>Redis</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}
