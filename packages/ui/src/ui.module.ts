/**
 * UI Module
 *
 * DI module for the shared UI package. Provides {@link ThemeService}
 * and {@link ThemeRegistry} as injectable services. Exposes a static
 * `forFeature()` method for declarative theme registration following
 * the `@stackra` module pattern.
 *
 * @module UIModule
 *
 * @example Basic Usage
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
import type { DynamicModule, Type } from "@stackra/ts-container";
import { THEME_SERVICE } from "./constants/tokens.constant";
import { ThemeRegistry } from "./registries/theme.registry";
import { ThemeService } from "./services/theme.service";
import type { ThemeFeatureOptions } from "./types/theme-feature-options.type";

// Cast classes to satisfy the DI container's Type<any> constraint.
// BaseRegistry's optional constructor param and ThemeService's
// ThemeRegistry dependency cause strict type mismatches with the
// container's generic provider signatures.
const ThemeRegistryProvider = ThemeRegistry as unknown as Type<ThemeRegistry>;
const ThemeServiceProvider = ThemeService as unknown as Type<ThemeService>;

/**
 * UIModule — the DI module for the shared UI package.
 *
 * Registers {@link ThemeRegistry} and {@link ThemeService} as
 * providers and exports them for injection by other modules.
 *
 * Use the static `forFeature()` method to declaratively register
 * theme definitions from your app module.
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
@Module({
  providers: [ThemeRegistryProvider, { provide: THEME_SERVICE, useClass: ThemeServiceProvider }],
  exports: [ThemeRegistryProvider, THEME_SERVICE],
})
export class UIModule {
  /**
   * Register theme definitions into the ThemeRegistry.
   *
   * Accepts a {@link ThemeFeatureOptions} object containing an array
   * of {@link ThemeDefinition} entries and registers each one into
   * the global {@link ThemeRegistry}. Returns a dynamic module
   * configuration for the DI container.
   *
   * @param options - Configuration containing the themes to register
   * @returns A dynamic module configuration with registered themes.
   *
   * @example
   * ```typescript
   * UIModule.forFeature({
   *   themes: [
   *     { baseName: "lavender", label: "Lavender", icon: "palette", accentColor: "oklch(77% 0.13 305)", variants: ["lavender-light", "lavender-dark"] },
   *     { baseName: "mint", label: "Mint", icon: "leaf", accentColor: "oklch(77% 0.15 165)", variants: ["mint-light", "mint-dark"] },
   *   ],
   * });
   * ```
   */
  public static forFeature(options: ThemeFeatureOptions): DynamicModule {
    return {
      module: UIModule,
      providers: [
        ThemeRegistryProvider,
        { provide: THEME_SERVICE, useClass: ThemeServiceProvider },
        {
          provide: "THEME_FEATURE_INIT",
          useFactory: (registry: ThemeRegistry) => {
            for (const definition of options.themes) {
              registry.registerDefinition(definition);
            }

            return true;
          },
          inject: [ThemeRegistryProvider],
        },
      ],
      exports: [ThemeRegistryProvider, THEME_SERVICE],
    };
  }
}
