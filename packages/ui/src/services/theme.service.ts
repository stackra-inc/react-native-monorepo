/**
 * Theme Service
 *
 * Manages theme state, switching, persistence, and system color
 * scheme detection. Delegates runtime CSS variable switching to
 * Uniwind, persists the user's choice to AsyncStorage, and
 * exposes the current theme to React components via context.
 *
 * Decorated with `@Injectable()` and accepts {@link ThemeRegistry}
 * as a constructor dependency.
 *
 * @module services/theme
 */

import { Injectable } from "@stackra/ts-container";
import { Str } from "@stackra/ts-support";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { Uniwind, ThemeTransitionPreset } from "uniwind";
import { ThemeRegistry } from "@/registries/theme.registry";
import type { ThemeDefinition } from "@/types/theme-definition.type";
import type { ThemeName } from "@/types/theme.type";

// ── Constants ───────────────────────────────────────────────────────────────

/**
 * AsyncStorage key used to persist the user's selected theme.
 */
const STORAGE_KEY = "@repo/ui:theme";

/**
 * ThemeService — manages app-wide theme state.
 *
 * Centralizes all theme logic (switching, persistence, system
 * detection) in a testable service outside React. Injected via
 * the DI container and accessed through {@link ThemeFacade}.
 *
 * @example
 * ```typescript
 * const themeService = container.get<ThemeService>(THEME_SERVICE);
 * await themeService.initialize();
 * themeService.setTheme("lavender-dark");
 * themeService.toggleTheme(); // switches to "lavender-light"
 * ```
 */
@Injectable()
export class ThemeService {
  /**
   * The currently active theme variant name.
   *
   * @internal
   */
  private _currentTheme: string = "light";

  /**
   * Create a new ThemeService instance.
   *
   * @param _registry - The theme registry containing all registered theme definitions
   */
  public constructor(private readonly _registry: ThemeRegistry) {}

  // ── Getters ─────────────────────────────────────────────────────────────

  /**
   * The currently active theme variant name.
   *
   * @returns The current theme variant string (e.g. "lavender-dark").
   *
   * @example
   * ```typescript
   * console.log(themeService.currentTheme); // "lavender-dark"
   * ```
   */
  public get currentTheme(): string {
    return this._currentTheme;
  }

  /**
   * Whether the current theme is a light variant.
   *
   * Returns `true` if the theme name equals `"light"` or ends
   * with `"-light"`.
   *
   * @returns `true` for light themes, `false` otherwise.
   *
   * @example
   * ```typescript
   * themeService.setTheme("lavender-light");
   * themeService.isLight; // true
   * ```
   */
  public get isLight(): boolean {
    return this._currentTheme === "light" || Str.endsWith(this._currentTheme, "-light");
  }

  /**
   * Whether the current theme is a dark variant.
   *
   * Returns `true` if the theme name equals `"dark"` or ends
   * with `"-dark"`.
   *
   * @returns `true` for dark themes, `false` otherwise.
   *
   * @example
   * ```typescript
   * themeService.setTheme("lavender-dark");
   * themeService.isDark; // true
   * ```
   */
  public get isDark(): boolean {
    return this._currentTheme === "dark" || Str.endsWith(this._currentTheme, "-dark");
  }

  // ── Public Methods ──────────────────────────────────────────────────────

  /**
   * Initialize the service by reading the persisted theme or
   * detecting the system color scheme.
   *
   * Called once during app bootstrap. Reads from AsyncStorage
   * first; if no persisted theme exists, falls back to the
   * device's system color scheme via `Appearance.getColorScheme()`.
   *
   * @returns A promise that resolves when initialization is complete.
   *
   * @example
   * ```typescript
   * await themeService.initialize();
   * ```
   */
  public async initialize(): Promise<void> {
    try {
      const persisted = await AsyncStorage.getItem(STORAGE_KEY);

      if (persisted) {
        this._currentTheme = persisted;
        Uniwind.setTheme(persisted as ThemeName);
        return;
      }
    } catch (error) {
      // AsyncStorage read failure — log and fall through to system detection
      console.error("[ThemeService] Failed to read persisted theme:", error);
    }

    // No persisted theme or read failed — use system color scheme
    const colorScheme = Appearance.getColorScheme();
    const initialTheme = colorScheme === "dark" ? "dark" : "light";

    this._currentTheme = initialTheme;
    Uniwind.setTheme(initialTheme as ThemeName);
  }

  /**
   * Switch to a specific theme variant.
   *
   * Delegates to `Uniwind.setTheme()` to apply the CSS variable
   * theme at runtime with an optional animated transition (Uniwind Pro).
   * Persists the choice to AsyncStorage.
   *
   * @param variantName - The theme variant name to activate (e.g. "lavender-dark")
   * @param transition - Optional transition preset for animated theme switching.
   *   Defaults to `ThemeTransitionPreset.None` (instant). Requires Uniwind Pro.
   * @returns void
   *
   * @example
   * ```typescript
   * // Instant switch
   * themeService.setTheme("lavender-dark");
   *
   * // With fade transition (Uniwind Pro)
   * themeService.setTheme("lavender-dark", ThemeTransitionPreset.Fade);
   *
   * // With circle reveal (Uniwind Pro)
   * themeService.setTheme("mint-light", ThemeTransitionPreset.CircleCenter);
   * ```
   */
  public setTheme(variantName: ThemeName, transition?: ThemeTransitionPreset): void {
    this._currentTheme = variantName;

    if (transition !== undefined && transition !== ThemeTransitionPreset.None) {
      Uniwind.setTheme(variantName, { preset: transition });
    } else {
      Uniwind.setTheme(variantName);
    }

    // Fire-and-forget persistence
    AsyncStorage.setItem(STORAGE_KEY, variantName).catch((error) => {
      console.error("[ThemeService] Failed to persist theme:", error);
    });
  }

  /**
   * Toggle between light and dark variants of the current theme.
   *
   * Looks up the current theme in the registry via `findByVariant`,
   * then switches to the opposite variant with a Fade transition.
   * Falls back to `"dark"` if the current theme is not found in
   * any registered definition.
   *
   * @param transition - Optional transition preset. Defaults to `Fade`.
   * @returns void
   *
   * @example
   * ```typescript
   * // Current theme: "lavender-light"
   * themeService.toggleTheme();
   * // Now: "lavender-dark" (with Fade transition)
   *
   * // With custom transition
   * themeService.toggleTheme(ThemeTransitionPreset.Blur);
   * ```
   */
  public toggleTheme(transition: ThemeTransitionPreset = ThemeTransitionPreset.Fade): void {
    const definition = this._registry.findByVariant(this._currentTheme);

    if (!definition) {
      this.setTheme("dark" as ThemeName, transition);
      return;
    }

    const [light, dark] = definition.variants;
    const opposite = this._currentTheme === light ? dark : light;

    this.setTheme(opposite as ThemeName, transition);
  }

  /**
   * Get the current theme variant name.
   *
   * Alias for the {@link currentTheme} getter, useful for
   * facade access patterns.
   *
   * @returns The current theme variant string.
   *
   * @example
   * ```typescript
   * const theme = themeService.getCurrentTheme();
   * ```
   */
  public getCurrentTheme(): string {
    return this._currentTheme;
  }

  /**
   * Get all registered theme definitions from the registry.
   *
   * Convenience method that delegates to `ThemeRegistry.getAll()`,
   * allowing components to access registered themes through the
   * facade without needing a direct reference to the registry.
   *
   * @returns An array of all registered {@link ThemeDefinition} entries.
   *
   * @example
   * ```typescript
   * const themes = themeService.getRegisteredThemes();
   * themes.forEach((t) => console.log(t.label));
   * ```
   */
  public getRegisteredThemes(): ThemeDefinition[] {
    return this._registry.getAll();
  }
}
