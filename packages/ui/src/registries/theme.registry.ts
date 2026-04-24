/**
 * Theme Registry
 *
 * Centralized registry of all available themes. Extends
 * {@link BaseRegistry} from `@stackra/ts-support` to store
 * {@link ThemeDefinition} entries keyed by base theme name.
 *
 * Decorated with `@Injectable()` so it can be resolved through
 * the DI container and injected into services like ThemeService.
 *
 * @module registries/theme
 */

import { Injectable } from "@stackra/ts-container";
import { BaseRegistry, Str } from "@stackra/ts-support";
import type { ThemeDefinition } from "@/types/theme-definition.type";

/**
 * Centralized registry of all available themes.
 *
 * Stores {@link ThemeDefinition} entries keyed by `baseName` and
 * provides lookup methods for the ThemeService and ThemeSwitcher
 * to discover registered themes dynamically.
 *
 * @example
 * ```typescript
 * const registry = new ThemeRegistry();
 * registry.register({
 *   baseName: "lavender",
 *   label: "Lavender",
 *   icon: "palette",
 *   accentColor: "oklch(77% 0.13 305)",
 *   variants: ["lavender-light", "lavender-dark"],
 * });
 *
 * registry.has("lavender"); // true
 * registry.get("lavender"); // ThemeDefinition
 * registry.getAll();        // ThemeDefinition[]
 * ```
 */
@Injectable()
export class ThemeRegistry extends BaseRegistry<ThemeDefinition> {
  /**
   * Register a theme definition keyed by its `baseName`.
   *
   * Overwrites any existing entry with the same `baseName`,
   * allowing theme redefinition at runtime. Delegates to the
   * parent `BaseRegistry.register()` method.
   *
   * @param definition - The theme definition to register
   * @returns void
   *
   * @example
   * ```typescript
   * registry.registerDefinition({
   *   baseName: "mint",
   *   label: "Mint",
   *   icon: "leaf",
   *   accentColor: "oklch(77% 0.15 165)",
   *   variants: ["mint-light", "mint-dark"],
   * });
   * ```
   */
  public registerDefinition(definition: ThemeDefinition): void {
    this.register(definition.baseName, definition);
  }

  /**
   * Find the theme definition that owns a given variant name.
   *
   * Searches all registered definitions for a matching light or
   * dark variant using case-insensitive comparison via `Str.lower`.
   *
   * @param variantName - The variant name to search for (e.g. "lavender-dark")
   * @returns The matching {@link ThemeDefinition}, or `undefined` if no
   *   definition contains the variant.
   *
   * @example
   * ```typescript
   * const theme = registry.findByVariant("lavender-dark");
   * // Returns the "lavender" ThemeDefinition
   * ```
   */
  public findByVariant(variantName: string): ThemeDefinition | undefined {
    const allThemes = this.getAll();

    for (const definition of allThemes) {
      const [light, dark] = definition.variants;

      if (
        Str.lower(variantName) === Str.lower(light) ||
        Str.lower(variantName) === Str.lower(dark)
      ) {
        return definition;
      }
    }

    return undefined;
  }
}
