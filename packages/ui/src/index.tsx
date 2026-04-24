/**
 * @repo/ui — Shared UI Component Library
 *
 * Single source of truth for all UI components in the monorepo.
 * Re-exports HeroUI Native components alongside custom wrappers
 * and project-specific utilities.
 *
 * Apps should **never** import directly from `heroui-native` — always
 * go through `@repo/ui` so we can swap, wrap, or extend components
 * in one place.
 *
 * @example
 * ```tsx
 * import { Button, Card, UIProvider } from '@repo/ui';
 * ```
 *
 * @module @repo/ui
 */

// ============================================================================
// Provider
// ============================================================================
export { UIProvider } from "./providers/ui-provider";
export type { UIProviderProps } from "./providers/ui-provider";

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
