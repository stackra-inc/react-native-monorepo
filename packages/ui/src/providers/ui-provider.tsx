/**
 * UIProvider — Root provider for the shared UI layer.
 *
 * Wraps `HeroUINativeProvider` and `ThemeProvider` with sensible
 * defaults for the monorepo. Every app should render a single
 * `<UIProvider>` at its root layout, inside a
 * `<GestureHandlerRootView>`.
 *
 * ## Architecture
 *
 * ```
 * GestureHandlerRootView   (app responsibility)
 *   └── UIProvider
 *         └── HeroUINativeProvider
 *               ├── SafeAreaListener
 *               ├── GlobalAnimationSettingsProvider
 *               ├── TextComponentProvider
 *               ├── ToastProvider
 *               ├── PortalHost
 *               └── ThemeProvider
 *                     └── children
 * ```
 *
 * @module providers/ui-provider
 */

import React from "react";
import { HeroUINativeProvider } from "heroui-native";
import type { HeroUINativeConfig } from "heroui-native";
import { ThemeProvider } from "./theme-provider";

/**
 * Props accepted by {@link UIProvider}.
 *
 * Extends the HeroUI Native config so apps can override any
 * provider-level setting (text scaling, animations, toast, etc.)
 * while still getting the monorepo defaults.
 */
export interface UIProviderProps {
  /**
   * Child elements rendered inside the provider tree.
   */
  children: React.ReactNode;

  /**
   * Optional HeroUI Native configuration overrides.
   *
   * When omitted the provider falls back to {@link DEFAULT_CONFIG}.
   *
   * @default DEFAULT_CONFIG
   */
  config?: HeroUINativeConfig;
}

/**
 * Default HeroUI Native configuration used across all apps.
 *
 * - Allows font scaling for accessibility.
 * - Caps the maximum font multiplier at 1.5× to prevent layout breakage.
 * - Keeps the dev-info styling-principles message disabled to reduce
 *   console noise during development.
 */
const DEFAULT_CONFIG: HeroUINativeConfig = {
  textProps: {
    allowFontScaling: true,
    maxFontSizeMultiplier: 1.5,
  },
  devInfo: {
    stylingPrinciples: false,
  },
};

/**
 * UIProvider — the single root provider every app must render.
 *
 * Wraps `HeroUINativeProvider` with project-wide defaults for text
 * scaling, animation, and toast configuration. Apps can override any
 * setting via the `config` prop.
 *
 * @param props - Provider props including children and optional config overrides.
 * @returns The provider tree wrapping the application content.
 *
 * @example
 * ```tsx
 * import { UIProvider } from '@repo/ui';
 * import { GestureHandlerRootView } from 'react-native-gesture-handler';
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <GestureHandlerRootView style={{ flex: 1 }}>
 *       <UIProvider>{children}</UIProvider>
 *     </GestureHandlerRootView>
 *   );
 * }
 * ```
 */
export function UIProvider({ children, config }: UIProviderProps): React.JSX.Element {
  const mergedConfig = config ?? DEFAULT_CONFIG;

  return (
    <HeroUINativeProvider config={mergedConfig}>
      <ThemeProvider>{children}</ThemeProvider>
    </HeroUINativeProvider>
  );
}
