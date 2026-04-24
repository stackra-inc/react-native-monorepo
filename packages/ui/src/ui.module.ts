/**
 * UI Module
 *
 * DI module for the shared UI package. Provides {@link ThemeService}
 * and {@link ThemeRegistry} as injectable services. Exposes a static
 * `forFeature()` method for declarative theme registration following
 * the `@stackra` module pattern.
 *
 * Follows the same pattern as `KbdModule` — uses a pre-created
 * singleton registry instance with `useValue` providers, avoiding
 * type casting entirely.
 *
 * @module UIModule
 *
 * @example
 * ```typescript
 * import { UIModule } from "@repo/ui";
 *
 * @Module({
 *   imports: [UIModule.forFeature({ themes: [...] })],
 * })
 * export class AppModule {}
 * ```
 */

import { Module } from "@stackra/ts-container";
import type { DynamicModule } from "@stackra/ts-container";
import { THEME_SERVICE } from "./constants/tokens.constant";
import { ThemeRegistry, themeRegistry } from "./registries/theme.registry";
import { ThemeService } from "./services/theme.service";
import type { ThemeFeatureOptions } from "./types/theme-feature-options.type";

/**
 * UIModule — the DI module for the shared UI package.
 *
 * Registers {@link ThemeRegistry} and {@link ThemeService} as
 * providers and exports them for injection by other modules.
 *
 * The ThemeRegistry is provided as a `useValue` singleton — the
 * same instance used by `forFeature()` to register themes. This
 * ensures all theme definitions are available to ThemeService
 * regardless of module initialization order.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     UIModule.forFeature({
 *       themes: [
 *         { baseName: "default", label: "Default", icon: "sun", accentColor: "oklch(55% 0.25 265)", variants: ["light", "dark"] },
 *       ],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
export class UIModule {
  /**
   * Register theme definitions into the ThemeRegistry.
   *
   * Accepts a {@link ThemeFeatureOptions} object containing an array
   * of {@link ThemeDefinition} entries and registers each one into
   * the global {@link ThemeRegistry} singleton. Returns a dynamic
   * module configuration for the DI container.
   *
   * Themes are registered immediately (before DI resolution) so
   * they are available when ThemeService initializes.
   *
   * @param options - Configuration containing the themes to register
   * @returns A dynamic module configuration with registered themes.
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
  public static forFeature(options: ThemeFeatureOptions): DynamicModule {
    // Register themes into the singleton immediately
    for (const definition of options.themes) {
      themeRegistry.registerDefinition(definition);
    }

    return {
      module: UIModule,
      global: true,
      providers: [
        { provide: ThemeRegistry, useValue: themeRegistry },
        { provide: THEME_SERVICE, useValue: new ThemeService(themeRegistry) },
      ],
      exports: [ThemeRegistry, THEME_SERVICE],
    };
  }
}
