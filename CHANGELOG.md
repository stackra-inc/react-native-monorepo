# Changelog — react-native-monorepo

All notable changes are documented here. Format:
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) Versioning:
[Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

### Added

- Turborepo monorepo with pnpm workspaces
- `apps/native` — Expo 55 + HeroUI Native mobile app
- `packages/ui` — shared component library
- `packages/typescript-config` — shared TypeScript configs
- HeroUI Native with Uniwind (Tailwind CSS v4 for React Native)
- React Native Reanimated 4.2 + Gesture Handler
- DI container via @stackra/ts-container
- Utility library via @stackra/ts-support
- Inter font family (4 weights)
- 4 custom themes (default, lavender, mint, sky)
- Tab navigation with Expo Router
- Keyboard controller integration
- EAS Build profiles (development, preview, production)
- Git hooks: pre-commit (lint-staged), commit-msg (commitlint)
- Prettier, ESLint, EditorConfig
- Changesets for versioning
- Cleanup scripts (`pnpm clean`, `pnpm reset`)
- Pinned native deps via pnpm overrides + .ncurc.json
