/**
 * Theme Type Definitions
 *
 * Centralized type definitions for the theming system.
 * Derives theme names from the Uniwind config so they stay
 * in sync with the registered CSS themes automatically.
 *
 * @module types/theme
 */

import type { UniwindConfig } from "uniwind";

/**
 * All available theme names derived from the Uniwind configuration.
 *
 * This type is a union of all theme strings registered in
 * `metro.config.ts` via `extraThemes` and defined in `global.css`
 * via `@variant` blocks.
 *
 * @example
 * ```typescript
 * const theme: ThemeName = "lavender-dark";
 * ```
 */
export type ThemeName = UniwindConfig["themes"][number];

/**
 * A theme pair consisting of a light and dark variant.
 *
 * Used by the theme toggle map to switch between light/dark
 * variants of the same base theme.
 */
export type ThemePair = [light: ThemeName, dark: ThemeName];

/**
 * Map of base theme names to their light/dark variant pairs.
 *
 * @example
 * ```typescript
 * const map: ThemeToggleMap = {
 *   default: ["light", "dark"],
 *   lavender: ["lavender-light", "lavender-dark"],
 * };
 * ```
 */
export type ThemeToggleMap = Record<string, ThemePair>;
