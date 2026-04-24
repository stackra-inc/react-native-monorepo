/**
 * @repo/ui — Shared UI Component Library
 *
 * Single source of truth for all UI components in the monorepo.
 * Components are sourced locally from the HeroUI Native codebase
 * (copied from heroui-native-main/src/) alongside custom wrappers,
 * theme management, and project-specific utilities.
 *
 * Apps should **never** import directly from component subdirectories —
 * always go through `@repo/ui` so we can swap, wrap, or extend in one place.
 *
 * @example
 * ```tsx
 * import { Button, Card, UIProvider, ThemeProvider, useAppTheme } from '@repo/ui';
 * ```
 *
 * @module @repo/ui
 */

// ============================================================================
// Providers — Custom (Stackra)
// ============================================================================
export { UIProvider } from "./providers/ui-provider";
export type { UIProviderProps } from "./providers/ui-provider";

export { ThemeProvider } from "./providers/theme-provider";
export type { ThemeProviderProps } from "./providers/theme-provider";

// ============================================================================
// DI Module
// ============================================================================
export { UIModule } from "./ui.module";

// ============================================================================
// Services
// ============================================================================
export { ThemeService } from "./services/theme.service";

// ============================================================================
// Registries
// ============================================================================
export { ThemeRegistry } from "./registries/theme.registry";

// ============================================================================
// Facades
// ============================================================================
export { ThemeFacade } from "./facades/theme.facade";

// ============================================================================
// Constants
// ============================================================================
export { THEME_SERVICE } from "./constants/tokens.constant";

// ============================================================================
// Hooks — Custom (Stackra)
// ============================================================================
export { useAppTheme } from "./hooks/use-app-theme.hook";

// ============================================================================
// Contexts — Custom (Stackra)
// ============================================================================
export { AppThemeContext } from "./contexts/theme.context";
export type { AppThemeContextValue } from "./contexts/theme.context";

// ============================================================================
// Components — Custom (Stackra)
// ============================================================================
export { ThemeSwitcher } from "./components/theme-switcher.component";

// ============================================================================
// Types — Custom (Stackra)
// ============================================================================
export type { ThemeName, ThemePair, ThemeToggleMap } from "./types/theme.type";
export type { ThemeDefinition } from "./types/theme-definition.type";
export type { ThemeFeatureOptions } from "./types/theme-feature-options.type";

// ============================================================================
// Uniwind Pro — Theme Transitions
// ============================================================================
export { ThemeTransitionPreset } from "uniwind";

// ============================================================================
// Components — HeroUI Native (from source)
// ============================================================================
export * from "./components/accordion";
export * from "./components/alert";
export * from "./components/avatar";
export * from "./components/bottom-sheet";
export * from "./components/button";
export * from "./components/card";
export * from "./components/checkbox";
export * from "./components/chip";
export * from "./components/close-button";
export * from "./components/control-field";
export * from "./components/description";
export * from "./components/dialog";
export * from "./components/field-error";
export * from "./components/input";
export * from "./components/input-group";
export * from "./components/input-otp";
export * from "./components/label";
export * from "./components/link-button";
export * from "./components/list-group";
export * from "./components/menu";
export * from "./components/popover";
export * from "./components/pressable-feedback";
export * from "./components/radio";
export * from "./components/radio-group";
export * from "./components/scroll-shadow";
export * from "./components/search-field";
export * from "./components/select";
export * from "./components/separator";
export * from "./components/skeleton";
export * from "./components/skeleton-group";
export * from "./components/slider";
export * from "./components/spinner";
export * from "./components/sub-menu";
export * from "./components/surface";
export * from "./components/switch";
export * from "./components/tabs";
export * from "./components/tag-group";
export * from "./components/text-area";
export * from "./components/text-field";
export * from "./components/toast";

// ============================================================================
// Portal — HeroUI Native (from source)
// ============================================================================
export * from "./primitives/portal";

// ============================================================================
// Hooks — HeroUI Native (from source)
// ============================================================================
export * from "./helpers/external/hooks";

// ============================================================================
// Utils — HeroUI Native (from source)
// ============================================================================
export * from "./helpers/external/utils";

// ============================================================================
// Contexts — HeroUI Native (from source)
// ============================================================================
export * from "./helpers/external/contexts";

// ============================================================================
// Provider — HeroUI Native (from source)
// ============================================================================
export * from "./providers/hero-ui-native";
