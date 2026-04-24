/**
 * @repo/ui — Shared UI Component Library
 *
 * Single source of truth for all UI components in the monorepo.
 * Re-exports HeroUI Native components alongside custom wrappers,
 * theme management, and project-specific utilities.
 *
 * Apps should **never** import directly from `heroui-native` or
 * `uniwind` for theming — always go through `@repo/ui` so we can
 * swap, wrap, or extend in one place.
 *
 * @example
 * ```tsx
 * import { Button, Card, UIProvider, ThemeProvider, useAppTheme } from '@repo/ui';
 * ```
 *
 * @module @repo/ui
 */

// ============================================================================
// Providers
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
// Hooks
// ============================================================================
export { useAppTheme } from "./hooks/use-app-theme.hook";

// ============================================================================
// Contexts (for advanced use — prefer hooks)
// ============================================================================
export { AppThemeContext } from "./contexts/theme.context";
export type { AppThemeContextValue } from "./contexts/theme.context";

// ============================================================================
// Components — Custom
// ============================================================================
export { ThemeSwitcher } from "./components/theme-switcher.component";

// ============================================================================
// Types
// ============================================================================
export type { ThemeName, ThemePair, ThemeToggleMap } from "./types/theme.type";
export type { ThemeDefinition } from "./types/theme-definition.type";
export type { ThemeFeatureOptions } from "./types/theme-feature-options.type";

// ============================================================================
// Components — HeroUI Native re-exports
// ============================================================================
export {
  Accordion,
  Alert,
  Avatar,
  BottomSheet,
  Button,
  Card,
  Checkbox,
  Chip,
  CloseButton,
  ControlField,
  Description,
  Dialog,
  FieldError,
  Input,
  InputGroup,
  InputOTP,
  Label,
  LinkButton,
  ListGroup,
  Menu,
  Popover,
  PressableFeedback,
  RadioGroup,
  ScrollShadow,
  SearchField,
  Select,
  Separator,
  Skeleton,
  SkeletonGroup,
  Slider,
  Spinner,
  Surface,
  Switch,
  Tabs,
  TagGroup,
  TextArea,
  TextField,
  Toast,
} from "heroui-native";

// ============================================================================
// Hooks — HeroUI Native re-exports
// ============================================================================
export { useThemeColor, useButton, useAvatar } from "heroui-native";

// ============================================================================
// Types — HeroUI Native re-exports
// ============================================================================
export type { HeroUINativeConfig } from "heroui-native";
