/**
 * Theme Context
 *
 * React context for the app-wide theme state. Provides the current
 * theme name, light/dark detection, and functions to switch or
 * toggle themes.
 *
 * This context is provided by {@link ThemeProvider} and consumed
 * via the {@link useAppTheme} hook.
 *
 * @module contexts/theme
 */

import { createContext } from "react";
import type { ThemeName } from "@/types/theme.type";

/**
 * Shape of the theme context value.
 *
 * Exposes the current theme state and mutation functions
 * to any component in the tree.
 */
export interface AppThemeContextValue {
  /**
   * The currently active theme name.
   *
   * @example "lavender-dark"
   */
  currentTheme: string;

  /**
   * Whether the current theme is a light variant.
   */
  isLight: boolean;

  /**
   * Whether the current theme is a dark variant.
   */
  isDark: boolean;

  /**
   * Switch to a specific named theme.
   *
   * @param theme - The theme name to activate
   */
  setTheme: (theme: ThemeName) => void;

  /**
   * Toggle between the light and dark variant of the current theme.
   * For example, "lavender-light" toggles to "lavender-dark".
   */
  toggleTheme: () => void;
}

/**
 * React context instance for the theme system.
 *
 * Defaults to `undefined` — consumers must be wrapped in a
 * `ThemeProvider` or the `useAppTheme` hook will throw.
 */
export const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);
