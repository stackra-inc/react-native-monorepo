/**
 * Environment type declarations for the native app.
 *
 * Image module declarations and global type augmentations.
 * Uniwind theme types are auto-generated in uniwind.d.ts by Metro.
 *
 * @module types/env
 */

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
