---
inclusion: fileMatch
fileMatchPattern: "apps/native/**/*"
---

# Native App Standards

## Tech Stack

- **Expo 55** with Expo Router (file-based routing)
- **React Native 0.83.6** with New Architecture enabled
- **Uniwind Pro 1.1.0** (Tailwind CSS v4 for React Native)
- **React Native Reanimated 4.2.1** for animations
- **@stackra/ts-container** for dependency injection
- **@stackra/ts-support** for utilities (Str, Facade, Collection)

## File Naming

All files use **lower-kebab-case** with mandatory suffixes:

| Content          | Suffix                | Example                  |
| ---------------- | --------------------- | ------------------------ |
| Screen component | `index.tsx` in folder | `screens/home/index.tsx` |
| Service          | `.service.ts`         | `logger.service.ts`      |
| Module           | `.module.ts`          | `app.module.ts`          |
| Type             | `.type.ts`            | `theme.type.ts`          |
| Context          | `.context.ts`         | `theme.context.ts`       |
| Hook             | `.hook.ts`            | `use-app-theme.hook.ts`  |
| Constant         | `.constant.ts`        | `tokens.constant.ts`     |

## Routing Structure

```
src/app/
├── _layout.tsx          # Root layout (providers, fonts, bootstrap)
├── (tabs)/
│   ├── _layout.tsx      # Tab bar config
│   ├── index.tsx        # Home tab
│   ├── explore.tsx      # Explore tab
│   └── settings.tsx     # Settings tab
└── (auth)/
    ├── _layout.tsx      # Auth layout (no tabs)
    └── login.tsx        # Login screen
```

## DI Container

The app uses `@stackra/ts-container` (NestJS-style IoC):

- Bootstrap in `src/bootstrap.ts` — creates the Application and sets Facade
- Root module in `src/app.module.ts` — imports UIModule.forFeature()
- Services decorated with `@Injectable()`
- Modules decorated with `@Module()` and `@Global()`
- Access via Facades (typed proxies) or `ContainerProvider` context

**Critical**: The babel config MUST include
`babel-plugin-transform-typescript-metadata` for constructor injection to work.
Without it, `@Injectable()` classes get `undefined` for their constructor
parameters.

## Styling

- Use `className` prop on all components (Tailwind classes via Uniwind Pro)
- Import `@repo/ui` for all components — never `heroui-native`
- Global CSS entry: `src/styles/global.css`
- Theme CSS: `src/styles/themes/` (lavander.css, mint.css, sky.css)
- Font names: `Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`,
  `Inter_700Bold`

## Building

```bash
# Development build (required — Expo Go doesn't work)
npx expo prebuild --clean
npx expo run:ios

# Clean Metro cache
npx expo start -c

# Never use npx expo start alone — it opens Expo Go
```

## EAS Build Profiles

Defined in `eas.json`:

- `development` — simulator debug build
- `development-device` — physical device debug build
- `preview` — internal distribution (Release)
- `production` — App Store / Play Store distribution
