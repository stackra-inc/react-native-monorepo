/**
 * Theme Feature Options Type
 *
 * Configuration object passed to {@link UIModule.forFeature} to
 * declaratively register theme definitions into the ThemeRegistry.
 *
 * @module types/theme-feature-options
 */

import type { ThemeDefinition } from "./theme-definition.type";

/**
 * Configuration passed to `UIModule.forFeature()` to register themes.
 *
 * @example
 * ```typescript
 * UIModule.forFeature({
 *   themes: [
 *     { baseName: "lavender", label: "Lavender", icon: "palette", accentColor: "oklch(77% 0.13 305)", variants: ["lavender-light", "lavender-dark"] },
 *   ],
 * });
 * ```
 */
export interface ThemeFeatureOptions {
  /**
   * Array of theme definitions to register into the ThemeRegistry.
   */
  themes: ThemeDefinition[];
}
