/**
 * Theme Provider
 *
 * Bridges the DI-managed {@link ThemeService} into the React
 * component tree via {@link AppThemeContext}. Reads the current
 * theme from Uniwind, derives light/dark flags, and delegates
 * `setTheme` / `toggleTheme` to the ThemeService through the
 * {@link ThemeFacade}.
 *
 * The `AppThemeContextValue` interface is preserved so all
 * existing consumers of `useAppTheme` continue working without
 * changes.
 *
 * ## Usage
 *
 * ```tsx
 * import { ThemeProvider } from '@repo/ui';
 *
 * export default function RootLayout({ children }) {
 *   return <ThemeProvider>{children}</ThemeProvider>;
 * }
 * ```
 *
 * @module providers/theme-provider
 */

import React, { useCallback, useMemo } from "react";
import { Str } from "@stackra/ts-support";
import { useUniwind } from "uniwind";
import { AppThemeContext } from "../contexts/theme.context";
import { ThemeFacade } from "../facades/theme.facade";
import type { AppThemeContextValue } from "../contexts/theme.context";
import type { ThemeName } from "../types/theme.type";

// ── Props ───────────────────────────────────────────────────────────────────

/**
 * Props for {@link ThemeProvider}.
 */
export interface ThemeProviderProps {
  /**
   * Child elements rendered inside the theme context.
   */
  children: React.ReactNode;
}

// ── Component ───────────────────────────────────────────────────────────────

/**
 * ThemeProvider — bridges DI-managed theme state into React context.
 *
 * Reads the active theme from Uniwind's runtime, computes `isLight`
 * and `isDark` flags using `Str.endsWith`, and delegates `setTheme`
 * / `toggleTheme` to the {@link ThemeService} via {@link ThemeFacade}.
 *
 * @param props - Provider props containing children.
 * @returns The theme context provider wrapping children.
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const { theme } = useUniwind();

  const isLight = useMemo((): boolean => {
    return theme === "light" || Str.endsWith(theme, "-light");
  }, [theme]);

  const isDark = useMemo((): boolean => {
    return theme === "dark" || Str.endsWith(theme, "-dark");
  }, [theme]);

  /**
   * Switch to a specific named theme via ThemeService.
   *
   * @param newTheme - The theme name to activate
   */
  const setTheme = useCallback((newTheme: ThemeName): void => {
    ThemeFacade.setTheme(newTheme);
  }, []);

  /**
   * Toggle between the light and dark variant of the current theme
   * via ThemeService.
   */
  const toggleTheme = useCallback((): void => {
    ThemeFacade.toggleTheme();
  }, []);

  const value = useMemo(
    (): AppThemeContextValue => ({
      currentTheme: theme,
      isLight,
      isDark,
      setTheme,
      toggleTheme,
    }),
    [theme, isLight, isDark, setTheme, toggleTheme],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}
