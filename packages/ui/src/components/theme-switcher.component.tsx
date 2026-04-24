/**
 * Theme Switcher Component
 *
 * Data-driven theme selector that reads all registered themes from
 * the {@link ThemeRegistry} via the {@link ThemeFacade} and renders
 * selectable options with accent color previews. Contains zero
 * hardcoded theme names — all data comes from the registry.
 *
 * @module components/theme-switcher
 */

import React, { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import type { TextStyle, ViewStyle } from "react-native";
import { ThemeTransitionPreset } from "uniwind";
import { ThemeFacade } from "../facades/theme.facade";
import { useAppTheme } from "../hooks/use-app-theme.hook";
import type { ThemeDefinition } from "../types/theme-definition.type";
import type { ThemeName } from "../types/theme.type";

/**
 * ThemeSwitcher — a data-driven theme selector component.
 *
 * Reads all {@link ThemeDefinition} entries from the
 * {@link ThemeRegistry} via the {@link ThemeFacade} and renders
 * each as a selectable option with the theme's label and accent
 * color preview. Visually indicates the currently active theme.
 *
 * On selection, calls `ThemeService.setTheme()` with the
 * appropriate variant (light or dark) based on the current mode.
 *
 * @returns The theme switcher UI.
 *
 * @example
 * ```tsx
 * import { ThemeSwitcher } from "@repo/ui";
 *
 * function SettingsScreen() {
 *   return <ThemeSwitcher />;
 * }
 * ```
 */
export function ThemeSwitcher(): React.JSX.Element {
  const { currentTheme, isLight } = useAppTheme();

  // Read all registered themes from the registry via ThemeFacade
  const themes: ThemeDefinition[] = useMemo(() => {
    return ThemeFacade.getRegisteredThemes();
  }, [currentTheme]);

  /**
   * Handle theme selection by applying the correct variant
   * based on the current light/dark mode.
   *
   * @param definition - The selected theme definition
   */
  const handleSelect = useCallback(
    (definition: ThemeDefinition): void => {
      const [light, dark] = definition.variants;
      const variant = isLight ? light : dark;

      ThemeFacade.setTheme(variant as ThemeName, ThemeTransitionPreset.CircleCenter);
    },
    [isLight],
  );

  /**
   * Determine whether a theme definition is currently active
   * by checking if the current theme matches either variant.
   *
   * @param definition - The theme definition to check
   * @returns `true` if the theme is currently active
   */
  const isActive = useCallback(
    (definition: ThemeDefinition): boolean => {
      const [light, dark] = definition.variants;

      return currentTheme === light || currentTheme === dark;
    },
    [currentTheme],
  );

  return (
    <View testID="theme-switcher" style={viewStyles.container}>
      {themes.map((definition) => {
        const active = isActive(definition);

        return (
          <Pressable
            key={definition.baseName}
            testID={`theme-option-${definition.baseName}`}
            onPress={() => handleSelect(definition)}
            style={[viewStyles.option, active && viewStyles.optionActive]}
          >
            {/* Accent color preview */}
            <View
              testID={`theme-accent-${definition.baseName}`}
              style={[viewStyles.accentPreview, { backgroundColor: definition.accentColor }]}
            />

            {/* Theme label */}
            <Text testID={`theme-label-${definition.baseName}`} style={textStyles.label}>
              {definition.label}
            </Text>

            {/* Active indicator */}
            {active && (
              <View
                testID={`theme-active-${definition.baseName}`}
                style={viewStyles.activeIndicator}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

/**
 * View styles for the ThemeSwitcher layout elements.
 */
const viewStyles = StyleSheet.create<Record<string, ViewStyle>>({
  container: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionActive: {
    borderColor: "rgba(99, 102, 241, 0.6)",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  accentPreview: {
    height: 32,
    width: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.3)",
  },
  activeIndicator: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "rgba(99, 102, 241, 1)",
  },
});

/**
 * Text styles for the ThemeSwitcher label elements.
 */
const textStyles = StyleSheet.create<Record<string, TextStyle>>({
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
});
