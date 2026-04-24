/**
 * Theme Definition Type
 *
 * Describes a single theme family with its light/dark variant pair
 * and display metadata for the ThemeSwitcher UI. Each definition
 * is stored in the {@link ThemeRegistry} keyed by its `baseName`.
 *
 * @module types/theme-definition
 */

import type { ThemePair } from "./theme.type";

/**
 * Describes a single theme family with its light/dark variant pair
 * and display metadata for the ThemeSwitcher UI.
 *
 * @example
 * ```typescript
 * const lavender: ThemeDefinition = {
 *   baseName: "lavender",
 *   label: "Lavender",
 *   icon: "palette",
 *   accentColor: "oklch(77% 0.13 305)",
 *   variants: ["lavender-light", "lavender-dark"],
 * };
 * ```
 */
export interface ThemeDefinition {
  /**
   * Base theme name used as the registry key.
   *
   * @example "lavender"
   */
  baseName: string;

  /**
   * Human-readable display label shown in the theme switcher UI.
   *
   * @example "Lavender"
   */
  label: string;

  /**
   * Icon identifier for the theme switcher UI.
   *
   * @example "palette"
   */
  icon: string;

  /**
   * Accent color preview value (CSS color string) displayed
   * in the theme switcher as a visual indicator.
   *
   * @example "oklch(77% 0.13 305)"
   */
  accentColor: string;

  /**
   * The [light, dark] variant pair for this theme family.
   *
   * @example ["lavender-light", "lavender-dark"]
   */
  variants: ThemePair;
}
