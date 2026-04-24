/**
 * useAppTheme Hook
 *
 * Consumes the {@link AppThemeContext} to access the current theme
 * state and mutation functions. Must be used within a
 * {@link ThemeProvider}.
 *
 * @module hooks/use-app-theme
 */

import { useContext } from "react";
import { AppThemeContext } from "@/contexts/theme.context";
import type { AppThemeContextValue } from "@/contexts/theme.context";

/**
 * Access the app-wide theme state.
 *
 * Provides the current theme name, light/dark detection flags,
 * and functions to switch or toggle themes.
 *
 * @returns The theme context value with current state and actions.
 * @throws Error if called outside of a `ThemeProvider`.
 *
 * @example
 * ```tsx
 * import { useAppTheme } from '@repo/ui';
 *
 * function MyComponent() {
 *   const { isDark, toggleTheme, setTheme } = useAppTheme();
 *
 *   return (
 *     <Button onPress={toggleTheme}>
 *       {isDark ? "Switch to Light" : "Switch to Dark"}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useAppTheme(): AppThemeContextValue {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error(
      "useAppTheme must be used within a <ThemeProvider>. " +
        "Wrap your app with <ThemeProvider> in the root layout.",
    );
  }

  return context;
}
