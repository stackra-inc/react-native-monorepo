---
inclusion: manual
---

# Expo Build & Deploy Guide

## Development Workflow

### First Time Setup

```bash
cd mono
npm install
cd apps/native
npx expo prebuild --clean
npx expo run:ios
```

### Daily Development

```bash
cd mono/apps/native
npx expo run:ios          # builds + runs on simulator
# or if native code hasn't changed:
npx expo start -c         # Metro only (press i to open on simulator)
```

**Important**: After changing native dependencies (adding/removing npm packages
with native code), you MUST run `npx expo prebuild --clean` before `run:ios`.

### When to Rebuild Native

Rebuild (`npx expo prebuild --clean && npx expo run:ios`) when:

- Adding/removing packages with native modules
- Changing `app.json` native config (permissions, plugins, etc.)
- Changing `babel.config.js`
- Updating Expo SDK version
- Updating react-native version

### When Metro Restart is Enough

Just restart Metro (`npx expo start -c`) when:

- Changing JS/TS source code
- Changing CSS/styles
- Changing metro.config.js

## EAS Build (Cloud)

### Profiles

| Profile            | Use Case          | Command                                                 |
| ------------------ | ----------------- | ------------------------------------------------------- |
| development        | Simulator testing | `eas build --profile development --platform ios`        |
| development-device | Physical device   | `eas build --profile development-device --platform ios` |
| preview            | Internal testing  | `eas build --profile preview --platform ios`            |
| production         | App Store         | `eas build --profile production --platform ios`         |

### EAS Submit

```bash
# Submit to TestFlight
eas submit --platform ios --profile production

# Submit to Play Store (internal track)
eas submit --platform android --profile production
```

### Required Secrets

Before EAS Build/Submit, configure these in `eas.json` or EAS Secrets:

- `EXPO_TOKEN` — for CI/CD authentication
- Apple credentials — managed by EAS or manual
- Android keystore — managed by EAS or manual
- `SENTRY_AUTH_TOKEN` — for source map uploads (when Sentry is added)

## Metro Config

The metro config wrapping order matters:

```javascript
// Uniwind MUST be outermost
module.exports = withUniwindConfig(wrapWithReanimatedMetroConfig(config), {
  cssEntryFile: "./src/styles/global.css",
});
```

## Global CSS

The CSS entry file at `src/styles/global.css` must import in this order:

1. `@import "tailwindcss"` — Tailwind v4 core
2. `@import "uniwind"` — Uniwind bridge
3. `@import "../../../../packages/ui/src/styles/index.css"` — HeroUI design
   tokens
4. Theme variant imports (lavander.css, mint.css, sky.css)
5. `@source` directives for class scanning
6. `@layer theme` with font and radius variables
