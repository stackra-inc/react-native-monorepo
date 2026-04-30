/**
 * @fileoverview Mono CLI configuration for the React Native monorepo.
 *
 * Registers custom commands available as `mono react-native-monorepo:<command>`.
 * These extend the built-in CLI commands with repo-specific operations.
 *
 * @see https://github.com/stackra-inc/mono-cli
 */



export default ({
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
    {
      name: "changeset",
      description: "Create a new changeset for versioning",
      emoji: "📝",
      action: "pnpm changeset",
    },
    {
      name: "release",
      description: "Build packages and publish via changesets",
      emoji: "🚀",
      action: "pnpm turbo run build --filter='./packages/*' && pnpm changeset publish",
    },
    {
      name: "validate",
      description: "Run lint, typecheck, and build",
      emoji: "✅",
      action: "pnpm lint && pnpm check-types && pnpm build",
    },
    {
      name: "audit",
      description: "Run npm security audit",
      emoji: "🔒",
      action: "npm audit",
    },
  ],
});
