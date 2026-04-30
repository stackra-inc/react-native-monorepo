/**
 * @fileoverview Token utility functions for React Native.
 *
 * Mirrors the platform-agnostic functions from `@stackra/react-theming`
 * (`theme-token-mapper.ts`) for use in the React Native context. These
 * are duplicated here because the RN package cannot directly import from
 * the web theming package due to bundler and platform constraints.
 *
 * The mapping logic is intentionally identical to the web version to
 * ensure design tokens produce the same CSS variable names on both
 * platforms (Property 13 in the design document).
 *
 * @module providers/token-utils
 */

// ── Token-to-Variable Conversion ────────────────────────────────────────────

/**
 * Convert a snake_case token key to a CSS custom property name.
 *
 * Maps directly to HeroUI v3 / HeroUI Native variable names — NO `--theme-`
 * prefix. Underscores are replaced with hyphens and the result is prepended
 * with `--`.
 *
 * @param token - The snake_case token key from the backend API
 * @returns The corresponding CSS custom property name
 *
 * @example
 * ```typescript
 * tokenToCssVar('accent');
 * // → '--accent'
 *
 * tokenToCssVar('surface_secondary');
 * // → '--surface-secondary'
 *
 * tokenToCssVar('field_background');
 * // → '--field-background'
 *
 * tokenToCssVar('radius');
 * // → '--radius'
 *
 * tokenToCssVar('font_sans');
 * // → '--font-sans'
 * ```
 */
export function tokenToCssVar(token: string): string {
  // Replace all underscores with hyphens for kebab-case conversion
  const kebab = token.replace(/_/g, "-");
  return `--${kebab}`;
}

// ── Light/Dark Mode Separation ──────────────────────────────────────────────

/**
 * Separate a flat token object into light and dark mode groups.
 *
 * Tokens prefixed with `dark_` are placed into the dark group with the
 * prefix stripped. All other tokens go into the light group. Tokens with
 * `null` or `undefined` values are skipped in both groups.
 *
 * This separation is needed because Uniwind applies light and dark mode
 * variables under different `@variant` selectors.
 *
 * @param tokens - A flat token object from the backend API response
 * @returns An object with `light` and `dark` groups, each containing string values
 *
 * @example
 * ```typescript
 * separateTokensByMode({
 *   accent: 'oklch(0.62 0.19 253)',
 *   dark_background: 'oklch(0.12 0.005 285)',
 *   background: 'oklch(0.97 0 0)',
 * });
 * // → {
 * //     light: { accent: 'oklch(0.62 0.19 253)', background: 'oklch(0.97 0 0)' },
 * //     dark:  { background: 'oklch(0.12 0.005 285)' },
 * //   }
 * ```
 */
export function separateTokensByMode(tokens: Record<string, unknown>): {
  light: Record<string, string>;
  dark: Record<string, string>;
} {
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};

  for (const [key, value] of Object.entries(tokens)) {
    // Skip null/undefined values — they shouldn't produce CSS variables
    if (value == null) continue;

    if (key.startsWith("dark_")) {
      // Strip the 'dark_' prefix (5 characters) for the dark group
      dark[key.slice(5)] = String(value);
    } else {
      light[key] = String(value);
    }
  }

  return { light, dark };
}

// ── Token-to-Variable Mapping ───────────────────────────────────────────────

/**
 * Map a flat token object to an array of CSS variable entries.
 *
 * Returns `{ variable, value }` pairs where each token key is converted
 * to a CSS custom property name via {@link tokenToCssVar} and each value
 * is stringified. Tokens with `null` or `undefined` values are filtered out.
 *
 * @param tokens - A flat token object (typically one mode from {@link separateTokensByMode})
 * @returns An array of CSS variable entries ready for application via Uniwind
 *
 * @example
 * ```typescript
 * mapTokensToVars({ accent: 'oklch(0.62 0.19 253)' });
 * // → [{ variable: '--accent', value: 'oklch(0.62 0.19 253)' }]
 *
 * mapTokensToVars({ surface_secondary: '#f4f4f5', radius: '0.5rem' });
 * // → [
 * //     { variable: '--surface-secondary', value: '#f4f4f5' },
 * //     { variable: '--radius', value: '0.5rem' },
 * //   ]
 * ```
 */
export function mapTokensToVars(
  tokens: Record<string, unknown>,
): Array<{ variable: string; value: string }> {
  return Object.entries(tokens)
    .filter(([, v]) => v != null)
    .map(([key, value]) => ({
      variable: tokenToCssVar(key),
      value: String(value),
    }));
}
