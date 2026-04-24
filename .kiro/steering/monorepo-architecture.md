---
inclusion: auto
---

# Monorepo Architecture

This is a React Native monorepo managed by **npm workspaces** + **Turborepo**.

## Package Manager

- **npm** is the package manager. Never use pnpm, yarn, or bun commands.
- Run `npm install` from the monorepo root.
- Use `npm run <script>` or `npx` for commands.
- The `.npmrc` has `legacy-peer-deps=true` for peer dependency resolution.

## Workspace Structure

```
mono/
├── apps/
│   └── native/          # Expo 55 / RN 0.83.6 / React 19.2 mobile app
├── packages/
│   └── ui/              # @repo/ui — shared UI component library
├── turbo.json           # Turborepo task config
├── package.json         # Root workspace config
└── .npmrc               # npm config
```

## Running the Native App

The native app uses **Uniwind Pro** which requires NitroModules. It does NOT
work with Expo Go. Always use development builds:

```bash
cd apps/native
npx expo prebuild --clean   # regenerate native project
npx expo run:ios             # build + run on simulator
```

**Never** use `npx expo start` alone — it opens Expo Go which can't load
NitroModules. Use `npx expo run:ios` or `npx expo run:android`.

## Key Dependencies

| Package                    | Version | Purpose                           |
| -------------------------- | ------- | --------------------------------- |
| expo                       | 55.x    | App framework                     |
| react-native               | 0.83.6  | Mobile runtime                    |
| react                      | 19.2.0  | UI framework                      |
| uniwind (uniwind-pro)      | 1.1.0   | Tailwind CSS for RN (Pro)         |
| heroui-native              | removed | Components now in @repo/ui source |
| react-native-reanimated    | 4.2.1   | Animations                        |
| react-native-nitro-modules | 0.35.5+ | Required by Uniwind Pro           |
| @stackra/ts-container      | 2.0.9   | DI container (NestJS-style)       |
| @stackra/ts-support        | 2.5.7   | Utilities (Str, Facade, etc.)     |

## HeroUI Components — Local Source

HeroUI Native components are **NOT** imported from the `heroui-native` npm
package. They are copied from source into `packages/ui/src/` and compiled
locally by Metro. This was done because the npm package's compiled output uses
`Animated.createAnimatedComponent(Pressable)` which Uniwind Pro 1.1.0 cannot
style via className.

**Never add `heroui-native` as a dependency.** Import components from
`@repo/ui`.

## Babel Configuration

The native app's `babel.config.js` must include these plugins in order:

1. `babel-plugin-transform-typescript-metadata` — emits decorator metadata for
   DI
2. `@babel/plugin-proposal-decorators` with `{ legacy: true }` — decorator
   support
3. `module-resolver` — `@/` path aliases
4. `react-native-worklets/plugin` — required by Uniwind Pro

Do NOT add `react-native-reanimated/plugin` — it conflicts with the worklets
plugin.
