/**
 * UI Module
 *
 * DI module for the shared UI package. Provides {@link ThemeService}
 * and {@link ThemeRegistry} as injectable services. Exposes a static
 * `forFeature()` method for declarative theme registration following
 * the `@stackra` module pattern.
 *
 * ## Why the Type Assertion
 *
 * The container's `Type<T>` interface requires `new (...args: unknown[]): T`,
 * but `BaseRegistry` has an optional typed constructor param
 * (`new (options?: BaseRegistryOptions)`). This is a TypeScript-level
 * mismatch only — the DI container resolves both classes correctly at
 * runtime. The `as Type<T>` assertion bridges this gap without affecting
 * behavior. This is tracked as a known limitation of the container's
 * type definitions.
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
import type { DynamicModule, Type } from "@stackra/ts-container";
import { THEME_SERVICE } from "./constants/tokens.constant";
import { ThemeRegistry } from "./registries/theme.registry";
import { ThemeService } from "./services/theme.service";
import type { ThemeFeatureOptions } from "./types/theme-feature-options.type";

/**
 * UIModule — the DI module for the shared UI package.
 *
 * Registers {@link ThemeRegistry} and {@link ThemeService} as
 * singleton providers (container-managed) and exports them for
 * injection by other modules.
 *
 * Use the static `forFeature()` method to declaratively register
 * theme definitions from your app module.
 */
@Module({
  providers: [
    ThemeRegistry as Type<ThemeRegistry>,
    { provide: THEME_SERVICE, useClass: ThemeService as Type<ThemeService> },
  ],
  exports: [ThemeRegistry as Type<ThemeRegistry>, THEME_SERVICE],
})
export class UIModule {
  /**
   * Register theme definitions into the ThemeRegistry.
   *
   * Accepts a {@link ThemeFeatureOptions} object containing an array
   * of {@link ThemeDefinition} entries and registers each one into
   * the container-managed {@link ThemeRegistry} singleton. Returns a
   * dynamic module configuration for the DI container.
   *
   * Themes are registered via a factory provider that runs during
   * container resolution, ensuring the ThemeRegistry singleton is
   * populated before any service reads from it.
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
    return {
      module: UIModule,
      global: true,
      providers: [
        ThemeRegistry as Type<ThemeRegistry>,
        { provide: THEME_SERVICE, useClass: ThemeService as Type<ThemeService> },
        {
          provide: "THEME_FEATURE_INIT",
          useFactory: (registry: ThemeRegistry) => {
            for (const definition of options.themes) {
              registry.registerDefinition(definition);
            }
            return true;
          },
          inject: [ThemeRegistry as Type<ThemeRegistry>],
        },
      ],
      exports: [ThemeRegistry as Type<ThemeRegistry>, THEME_SERVICE],
    };
  }
}
