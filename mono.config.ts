/**
 * @fileoverview Mono CLI configuration for the React Native monorepo.
 *
 * Registers custom commands available as `mono react-native-monorepo:<command>`.
 * These commands are discovered automatically by the CLI at bootstrap.
 *
 * @see https://github.com/stackra-inc/mono-cli
 */

import { CliModule } from "@stackra/mono-cli";

export default CliModule.register({
  name: "react-native",
  description: "React Native monorepo — Expo apps and shared packages",
  commands: [
    {
      name: "ios",
      description: "Run the app on iOS simulator",
      emoji: "🍎",
      action: "npx expo run:ios",
    },
    {
      name: "android",
      description: "Run the app on Android emulator",
      emoji: "🤖",
      action: "npx expo run:android",
    },
    {
      name: "start",
      description: "Start Expo dev server",
      emoji: "🚀",
      action: "npx expo start",
    },
    {
      name: "prebuild",
      description: "Generate native iOS and Android projects",
      emoji: "📱",
      action: "npx expo prebuild",
    },
    {
      name: "eas:build",
      description: "Build with EAS Build",
      emoji: "🏗️",
      action: "npx eas build",
    },
    {
      name: "eas:submit",
      description: "Submit to App Store / Play Store",
      emoji: "📤",
      action: "npx eas submit",
    },
  ],
});
