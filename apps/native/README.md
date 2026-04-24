# HeroUI Native App

Expo 55 mobile app built with [HeroUI Native](https://heroui.com/docs/native),
[Uniwind](https://uniwind.dev) (Tailwind CSS v4), and
[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/).

## Tech Stack

- **Framework**: Expo 55 (SDK 55, React Native 0.83, React 19.2)
- **UI Library**: HeroUI Native with 4 custom themes
- **Styling**: Uniwind (Tailwind CSS v4 for React Native)
- **Animation**: React Native Reanimated 4.2
- **Navigation**: Expo Router (file-based, tab layout)
- **Fonts**: Inter (4 weights via @expo-google-fonts)
- **Keyboard**: react-native-keyboard-controller
- **DI Container**: @stackra/ts-container
- **Utilities**: @stackra/ts-support

## Getting Started

### Prerequisites

- Xcode (for iOS) or Android Studio (for Android)
- CocoaPods (`gem install cocoapods`)
- Booted simulator (`open -a Simulator`)

### Run on iOS Simulator

```bash
pnpm dev:ios
```

First run takes a few minutes (prebuild + CocoaPods + Xcode compile). Subsequent
runs reuse the native build and start instantly.

### Run Metro Only

```bash
pnpm dev
```

Use this when the native build is already installed on the simulator.

## Available Scripts

### Development

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `pnpm dev`         | Start Metro bundler             |
| `pnpm dev:ios`     | Build + run on iOS simulator    |
| `pnpm dev:android` | Build + run on Android emulator |

### Native Build

| Command               | Description                           |
| --------------------- | ------------------------------------- |
| `pnpm prebuild`       | Regenerate ios/ and android/ dirs     |
| `pnpm prebuild:clean` | Delete native dirs + regenerate fresh |
| `pnpm clean:native`   | Delete ios/ and android/ dirs only    |

### Simulators

| Command               | Description                      |
| --------------------- | -------------------------------- |
| `pnpm devices`        | List all available simulators    |
| `pnpm devices:booted` | Show currently booted simulators |

### Quality

| Command              | Description              |
| -------------------- | ------------------------ |
| `pnpm lint`          | Run ESLint on src/       |
| `pnpm lint:fix`      | Auto-fix lint issues     |
| `pnpm check-types`   | TypeScript type checking |
| `pnpm test`          | Run Jest tests           |
| `pnpm test:watch`    | Run tests in watch mode  |
| `pnpm test:coverage` | Run tests with coverage  |

## Project Structure

```
src/
├── app/                    # Expo Router (file-based routes)
│   ├── _layout.tsx         # Root layout (providers, fonts, DI)
│   ├── (tabs)/             # Tab navigation
│   │   ├── _layout.tsx     # Tab bar config
│   │   ├── index.tsx       # Home → screens/home
│   │   ├── explore.tsx     # Explore → screens/explore
│   │   └── settings.tsx    # Settings → screens/settings
│   └── (auth)/             # Auth flow (no tabs)
│       ├── _layout.tsx
│       └── login.tsx
├── screens/                # Screen components (heavy logic)
│   ├── home/
│   ├── explore/
│   └── settings/
├── components/             # Shared UI components
├── services/               # DI-injectable services
├── modules/                # DI module definitions
├── contexts/               # React contexts
├── hooks/                  # Custom hooks
├── utils/                  # Utility functions
├── styles/                 # CSS (global + themes)
│   ├── global.css          # Tailwind + Uniwind + HeroUI
│   └── themes/             # Lavender, Mint, Sky
├── types/                  # Type declarations
│   ├── env.d.ts            # Image modules, globals
│   └── uniwind.d.ts        # Theme types (auto-generated)
└── bootstrap.ts            # DI container initialization
```

## Themes

Four built-in themes with light/dark variants:

- **Default** — HeroUI Native default palette
- **Lavender** — Purple-toned theme
- **Mint** — Green-toned theme
- **Sky** — Blue-toned theme

Switch themes at runtime via the Settings tab or programmatically:

```tsx
import { Uniwind } from "uniwind";

Uniwind.setTheme("lavender-dark");
```

## EAS Build

Cloud builds via [EAS](https://expo.dev/eas):

```bash
# Development build (simulator)
npx eas build --platform ios --profile development

# Preview build (internal distribution)
npx eas build --platform ios --profile preview

# Production build (App Store)
npx eas build --platform ios --profile production
```

See `eas.json` for build profile configuration.

## Troubleshooting

### Build fails with code signing error

You're targeting a physical device. Run on simulator instead:

```bash
pnpm dev:ios
```

Or clean and rebuild:

```bash
pnpm prebuild:clean
pnpm dev:ios
```

### Metro can't resolve a module

pnpm's strict isolation can hide transitive deps. Add the missing package
explicitly:

```bash
pnpm add <missing-package>
```

### Styles not applying

HeroUI Native requires a development build (not Expo Go) because
`react-native-worklets` has native code. Run `pnpm dev:ios` to create a dev
build.
