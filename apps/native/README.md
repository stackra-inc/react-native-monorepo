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

## Dependency Injection

This app uses
[@stackra/ts-container](https://www.npmjs.com/package/@stackra/ts-container) for
NestJS-style dependency injection. Services are declared as injectable classes,
organized into modules, and resolved automatically via the container.

### How It Works

The DI system has three parts:

**1. `bootstrap.ts`** — initializes the container once at app startup.

```
_layout.tsx → useEffect → bootstrap() → Application.create(AppModule)
```

`bootstrap()` is called in the root `_layout.tsx` before the app renders. It
creates the DI container from `AppModule`, wires up all providers, and connects
the Facade system. The function is idempotent — calling it twice returns the
same instance.

**2. `app.module.ts`** — declares what services exist and how they connect.

```typescript
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class AppModule {}
```

- `@Module({ providers })` — registers services the container can create
- `@Module({ exports })` — makes services available to other modules
- `@Global()` — makes exports available everywhere without explicit imports

As the app grows, add more modules (e.g., `ApiModule`, `AuthModule`,
`StorageModule`) and import them into `AppModule`.

**3. Services** — injectable classes with `@Injectable()`.

```typescript
@Injectable()
export class LoggerService {
  log(message: string, context?: string) { ... }
}
```

### Using Services in Screens

Use the `useInject` hook to resolve a service in any React component:

```tsx
import { useInject } from "@stackra/ts-container";
import { LoggerService } from "@/services/logger.service";

export function HomeScreen() {
  const logger = useInject(LoggerService);

  return (
    <Button onPress={() => logger.log("Pressed!", "HomeScreen")}>
      Get Started
    </Button>
  );
}
```

The container resolves `LoggerService` automatically — no manual instantiation,
no prop drilling, no context boilerplate.

### Adding a New Service

1. Create the service in `src/services/`:

```typescript
// src/services/api.service.ts
@Injectable()
export class ApiService {
  constructor(private logger: LoggerService) {}

  async fetch(url: string) {
    this.logger.log(`Fetching ${url}`, "ApiService");
    return fetch(url).then((r) => r.json());
  }
}
```

2. Register it in `app.module.ts`:

```typescript
@Module({
  providers: [LoggerService, ApiService],
  exports: [LoggerService, ApiService],
})
export class AppModule {}
```

3. Use it in any screen via `useInject(ApiService)`.

### Provider Hierarchy

```
Application.create(AppModule)
└── AppModule (@Global)
    ├── LoggerService (singleton)
    └── ... your services
```

All providers are singletons by default. Use
`@Injectable({ scope: Scope.TRANSIENT })` for a new instance per injection
point.

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
