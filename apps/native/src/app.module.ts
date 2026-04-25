/**
 * App Module
 *
 * Root DI module for the native application. Registers global
 * services and imports feature modules including the UI theme
 * system via `UIModule.forFeature()`.
 *
 * @module app.module
 */

import { Module, Global } from "@stackra/ts-container";
import { UIModule } from "@repo/ui";
import { LoggerService } from "./services/logger.service";

/**
 * Root application module.
 *
 * Provides global services (LoggerService) and imports the UI
 * module with the default theme definitions for the app.
 */
@Global()
@Module({
  imports: [
    UIModule.forFeature({
      themes: [
        {
          baseName: "default",
          label: "Default",
          icon: "sun",
          accentColor: "oklch(66.78% 0.2232 36.66)",
          variants: ["light", "dark"],
        },
        {
          baseName: "lavender",
          label: "Lavender",
          icon: "palette",
          accentColor: "oklch(77% 0.13 305)",
          variants: ["lavender-light", "lavender-dark"],
        },
        {
          baseName: "mint",
          label: "Mint",
          icon: "leaf",
          accentColor: "oklch(77% 0.15 165)",
          variants: ["mint-light", "mint-dark"],
        },
        {
          baseName: "sky",
          label: "Sky",
          icon: "cloud",
          accentColor: "oklch(65% 0.2 230)",
          variants: ["sky-light", "sky-dark"],
        },
      ],
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class AppModule {}
