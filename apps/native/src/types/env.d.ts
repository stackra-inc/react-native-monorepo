/**
 * Environment type declarations for the native app.
 *
 * Consolidates all ambient type declarations: Uniwind themes,
 * image module declarations, and global type augmentations.
 *
 * @module types/env
 */

// ============================================================================
// Uniwind Theme Types (auto-generated — do not edit manually)
// ============================================================================
/// <reference types="uniwind/types" />

declare module "uniwind" {
  export interface UniwindConfig {
    themes: readonly [
      "light",
      "dark",
      "lavender-light",
      "lavender-dark",
      "mint-light",
      "mint-dark",
      "sky-light",
      "sky-dark",
    ];
  }
}

// ============================================================================
// Image Module Declarations
// ============================================================================
declare module "*.png" {
  import type { ImageSourcePropType } from "react-native";
  const value: ImageSourcePropType;
  export default value;
}

declare module "*.jpg" {
  import type { ImageSourcePropType } from "react-native";
  const value: ImageSourcePropType;
  export default value;
}

declare module "*.jpeg" {
  import type { ImageSourcePropType } from "react-native";
  const value: ImageSourcePropType;
  export default value;
}

declare module "*.svg" {
  import type { SvgProps } from "react-native-svg";
  import type { FC } from "react";
  const content: FC<SvgProps>;
  export default content;
}
