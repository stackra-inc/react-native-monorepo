/**
 * @fileoverview NativeThemeProvider — applies server-driven design tokens
 * via Uniwind.setTheme() for HeroUI Native components.
 *
 * This provider is the React Native counterpart to `WebThemeProvider` in
 * the web `@repo/ui` package. Both consume tokens from the shared
 * `@stackra/react-theming` context and apply them to their respective
 * rendering engines (DOM for web, Uniwind for RN).
 *
 * The token-to-variable mapping uses the same logic as the web version
 * (via `token-utils.ts`, mirrored from `theme-token-mapper.ts`) to ensure
 * design tokens produce identical CSS variable names on both platforms
 * (Property 13 in the design document).
 *
 * @module providers/native-theme-provider
 */

import React, { useEffect, type ReactNode } from "react";
import { separateTokensByMode, mapTokensToVars } from "./token-utils";

// ── Props ───────────────────────────────────────────────────────────────────

/**
 * Props for the {@link NativeThemeProvider} component.
 *
 * @example
 * ```tsx
 * <NativeThemeProvider
 *   tokens={serverTokens}
 *   fallbackTokens={{ accent: 'oklch(0.62 0.19 253)' }}
 * >
 *   <App />
 * </NativeThemeProvider>
 * ```
 */
interface NativeThemeProviderProps {
  /** Child elements rendered inside the provider */
  children: ReactNode;

  /**
   * Server-driven tokens from MobileSettingsSyncService.
   * These take precedence over `fallbackTokens` when available.
   * Typically loaded from the API or AsyncStorage cache.
   */
  tokens?: Record<string, unknown> | null;

  /**
   * Fallback tokens used when server tokens are unavailable.
   * These are typically hardcoded defaults or bundled with the app.
   */
  fallbackTokens?: Record<string, string>;
}

// ── Component ───────────────────────────────────────────────────────────────

/**
 * NativeThemeProvider — applies design tokens to HeroUI Native components
 * via Uniwind's runtime theme API.
 *
 * Consumes tokens from `MobileSettingsSyncService` (or fallback defaults)
 * and applies them using the same token-to-variable mapping as the web
 * `WebThemeProvider`. This ensures visual consistency across platforms.
 *
 * **Token resolution order:**
 * 1. `tokens` prop (server-driven, from API/cache)
 * 2. `fallbackTokens` prop (bundled defaults)
 * 3. No-op if both are empty
 *
 * **How tokens are applied:**
 * - Light tokens are mapped to CSS variables (e.g. `accent` → `--accent`)
 * - Dark tokens (prefixed with `dark_`) are mapped with a `dark:` prefix
 *   for Uniwind's dark variant system
 * - All variables are applied via `Uniwind.setTheme()` in a single batch
 *
 * @param props - Provider props with children, tokens, and fallback tokens
 * @returns The children wrapped with applied theme tokens
 *
 * @example
 * ```tsx
 * import { NativeThemeProvider } from '@repo/ui';
 *
 * function App() {
 *   const tokens = settingsService.get('theme');
 *
 *   return (
 *     <NativeThemeProvider tokens={tokens}>
 *       <MainScreen />
 *     </NativeThemeProvider>
 *   );
 * }
 * ```
 */
export function NativeThemeProvider({
  children,
  tokens,
  fallbackTokens,
}: NativeThemeProviderProps) {
  useEffect(() => {
    // Resolve tokens: prefer server-driven, fall back to bundled defaults
    const resolvedTokens = tokens ?? fallbackTokens ?? {};

    // Skip if there are no tokens to apply
    if (Object.keys(resolvedTokens).length === 0) return;

    // Separate into light and dark mode groups
    // Dark tokens are identified by the `dark_` prefix (e.g. `dark_background`)
    const { light, dark } = separateTokensByMode(resolvedTokens);

    // Convert token keys to CSS variable names
    const lightVars = mapTokensToVars(light);
    const darkVars = mapTokensToVars(dark);

    // Apply via Uniwind.setTheme() if the Uniwind runtime is available
    try {
      // Dynamic require — Uniwind may not be available in all environments
      // (e.g. during testing or in Storybook)
      const Uniwind = require("uniwind");

      if (Uniwind?.setTheme) {
        // Build a flat variable map for Uniwind's setTheme API
        const themeVars: Record<string, string> = {};

        // Light mode variables applied directly
        for (const { variable, value } of lightVars) {
          themeVars[variable] = value;
        }

        // Dark mode variables applied under Uniwind's `dark:` variant prefix
        // This maps to `@variant dark` in the Uniwind runtime
        for (const { variable, value } of darkVars) {
          themeVars[`dark:${variable}`] = value;
        }

        // Apply all variables in a single batch call
        Uniwind.setTheme(themeVars);
      }
    } catch {
      // Uniwind not available — tokens will not be applied.
      // This is expected in test environments or when Uniwind Pro
      // is not installed. Components fall back to their default styles.
    }
  }, [tokens, fallbackTokens]);

  // This provider is purely side-effect based (applies tokens via Uniwind).
  // It does not add any React context — theme context is managed by
  // ThemeProvider and AppThemeContext separately.
  return <>{children}</>;
}
