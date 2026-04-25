# React Native Monorepo

Production-ready Turborepo monorepo template for React Native with
[Expo](https://expo.dev), [HeroUI Native](https://heroui.com/docs/native),
[Uniwind](https://uniwind.dev) (Tailwind CSS v4), and
[npm](https://www.npmjs.com) workspaces.

Built by [Stackra](https://stackra.com).

## What's Inside

### Apps

| App           | Description                | Stack                                       |
| ------------- | -------------------------- | ------------------------------------------- |
| `apps/native` | Mobile app (iOS & Android) | Expo 55, HeroUI Native, Uniwind, Reanimated |

### Packages

| Package                      | Description                       |
| ---------------------------- | --------------------------------- |
| `packages/ui`                | Shared UI components (`@repo/ui`) |
| `packages/typescript-config` | Shared TypeScript configurations  |

## Tech Stack

- **Runtime**: Expo 55 / React Native 0.83 / React 19.2
- **UI**: HeroUI Native with 4 custom themes (default, lavender, mint, sky)
- **Styling**: Uniwind (Tailwind CSS v4 for React Native)
- **Animation**: React Native Reanimated 4.2
- **Navigation**: Expo Router (file-based, tab layout)
- **DI Container**: @stackra/ts-container (NestJS-style IoC)
- **Utilities**: @stackra/ts-support (Laravel-style Str, Collection)
- **Fonts**: Inter (4 weights via @expo-google-fonts)
- **Keyboard**: react-native-keyboard-controller
- **Monorepo**: Turborepo + npm workspaces
- **Quality**: ESLint, Prettier, Commitlint, Husky, lint-staged

## Quick Start

### Prerequisites

- Node.js >= 18 (24 recommended)
- npm
- Xcode (for iOS) or Android Studio (for Android)

### Setup

```bash
# Clone
git clone https://github.com/stackra-inc/react-native-monorepo.git
cd react-native-monorepo

# Install
npm install

# Run on iOS simulator
cd apps/native
npx expo run:ios --device simulator
```

### Development

```bash
# Start Metro bundler
npm run dev -- --filter native

# Or run directly
cd apps/native
npx expo start
```

## Project Structure

```
├── apps/
│   └── native/
│       ├── index.js                 # Expo entry point
│       ├── app.json                 # Expo config
│       ├── eas.json                 # EAS Build profiles
│       ├── metro.config.ts          # Metro + Uniwind + Reanimated
│       └── src/
│           ├── app/                 # Expo Router (file-based routes)
│           │   ├── _layout.tsx      # Root layout (providers, fonts)
│           │   ├── (tabs)/          # Tab navigation
│           │   │   ├── _layout.tsx  # Tab bar config
│           │   │   ├── index.tsx    # Home tab
│           │   │   ├── explore.tsx  # Explore tab
│           │   │   └── settings.tsx # Settings tab
│           │   └── (auth)/          # Auth flow (no tabs)
│           │       ├── _layout.tsx
│           │       └── login.tsx
│           ├── screens/             # Screen components (heavy logic)
│           │   ├── home/
│           │   ├── explore/
│           │   └── settings/
│           ├── components/          # Shared UI components
│           ├── services/            # DI-injectable services
│           ├── modules/             # DI module definitions
│           ├── contexts/            # React contexts
│           ├── hooks/               # Custom hooks
│           ├── utils/               # Utility functions
│           ├── styles/              # CSS (global + themes)
│           │   ├── global.css
│           │   └── themes/
│           ├── types/               # Type declarations
│           └── bootstrap.ts         # DI container init
├── packages/
│   ├── ui/                          # Shared component library
│   └── typescript-config/           # Shared tsconfig
├── turbo.json                       # Turborepo task config
├── package.json                     # Workspace definition (workspaces field)
├── .ncurc.json                      # ncu reject list (pinned deps)
├── commitlint.config.ts             # Conventional commits
├── prettier.config.js               # Code formatting
└── .husky/                          # Git hooks
```

## Available Scripts

### Development

| Command                          | Description                 |
| -------------------------------- | --------------------------- |
| `npm run dev`                    | Start all apps in dev mode  |
| `npm run dev -- --filter native` | Start native app only       |
| `npm run build`                  | Build all packages and apps |
| `npm run start`                  | Start all apps              |

### Quality

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `npm run lint`         | Run ESLint across all packages     |
| `npm run lint:fix`     | Auto-fix lint issues               |
| `npm run format`       | Format all files with Prettier     |
| `npm run format:check` | Check formatting without writing   |
| `npm run check-types`  | TypeScript type checking           |
| `npm run validate`     | Run lint + types + build (CI gate) |

### Testing

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm run test`          | Run all tests                  |
| `npm run test:watch`    | Run tests in watch mode        |
| `npm run test:coverage` | Run tests with coverage report |

### Maintenance

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run clean`       | Remove build artifacts               |
| `npm run clean:cache` | Clear Turbo and build caches         |
| `npm run clean:deps`  | Remove all node_modules + lockfile   |
| `npm run clean:all`   | Nuclear clean (build + cache + deps) |
| `npm run reset`       | Clean everything and reinstall       |
| `npm run audit`       | Security audit                       |

### Release

| Command                     | Description                   |
| --------------------------- | ----------------------------- |
| `npm run changeset`         | Create a changeset            |
| `npm run changeset:version` | Bump versions from changesets |
| `npm run changeset:publish` | Publish packages              |
| `npm run release`           | Build packages + publish      |

## Pinned Dependencies

Native dependencies are pinned in the root `package.json` (via `overrides`) to
ensure Expo 55 compatibility. The `.ncurc.json` in `apps/native` prevents
`ncu -u` from bumping these.

| Package                        | Pinned Version | Reason                |
| ------------------------------ | -------------- | --------------------- |
| react                          | 19.2.0         | Expo 55 requirement   |
| react-native                   | 0.83.2         | Expo 55 requirement   |
| react-native-reanimated        | 4.2.1          | RN 0.83 compatibility |
| react-native-worklets          | 0.7.4          | Reanimated 4.2.1 peer |
| react-native-gesture-handler   | 2.28.0         | HeroUI Native docs    |
| react-native-safe-area-context | 5.6.0          | HeroUI Native docs    |
| react-native-screens           | 4.16.0         | HeroUI Native docs    |
| react-native-svg               | 15.12.1        | HeroUI Native docs    |
| @gorhom/bottom-sheet           | 5.2.8          | HeroUI Native docs    |

## Building for Devices

### iOS Simulator

```bash
cd apps/native
npx expo run:ios --device simulator
```

### iOS Device (requires Apple Developer account)

```bash
cd apps/native
npx expo run:ios --device
```

### Android Emulator

```bash
cd apps/native
npx expo run:android
```

### EAS Build (cloud)

```bash
cd apps/native
npx eas build --platform ios --profile development
npx eas build --platform ios --profile production
```
