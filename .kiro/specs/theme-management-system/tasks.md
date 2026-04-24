# Implementation Plan: Theme Management System

## Overview

Replace the hardcoded theme infrastructure with a dynamic, registry-driven
architecture built on `@stackra` DI conventions. Implementation proceeds
bottom-up: types and constants first, then the registry and service layer,
followed by the DI module, React bridge (ThemeProvider refactor), the new
ThemeSwitcher component, barrel exports, and finally app-level wiring in
`apps/native`.

All new files go in `packages/ui/src/` following `@stackra` kebab-case + suffix
conventions. TypeScript is the implementation language throughout.

## Tasks

- [ ] 1. Create type definitions and DI token
  - [ ] 1.1 Create `ThemeDefinition` interface in
        `packages/ui/src/types/theme-definition.type.ts`
    - Define `ThemeDefinition` interface with `baseName`, `label`, `icon`,
      `accentColor`, and `variants: ThemePair` fields
    - Import `ThemePair` from `theme.type.ts` using `import type`
    - Include full JSDoc docblocks on the interface and every field
    - _Requirements: 1.2, 10.1, 10.3_

  - [ ] 1.2 Create `ThemeFeatureOptions` interface in
        `packages/ui/src/types/theme-feature-options.type.ts`
    - Define `ThemeFeatureOptions` interface with a `themes: ThemeDefinition[]`
      field
    - Import `ThemeDefinition` using `import type`
    - Include full JSDoc docblocks
    - _Requirements: 5.2, 10.1, 10.3_

  - [ ] 1.3 Create `THEME_SERVICE` token in
        `packages/ui/src/constants/tokens.constant.ts`
    - Create the `constants/` directory and `tokens.constant.ts` file
    - Define `export const THEME_SERVICE = Symbol.for("THEME_SERVICE")`
    - Include full JSDoc docblock with injection example
    - _Requirements: 6.1, 10.1_

  - [ ] 1.4 Update `packages/ui/src/types/index.ts` barrel to export new types
    - Add `export type` entries for `ThemeDefinition` and `ThemeFeatureOptions`
    - _Requirements: 10.6_

- [ ] 2. Implement ThemeRegistry
  - [ ] 2.1 Create `ThemeRegistry` class in
        `packages/ui/src/registries/theme.registry.ts`
    - Create the `registries/` directory
    - Extend `BaseRegistry<ThemeDefinition>` from `@stackra/ts-support`
    - Decorate with `@Injectable()` from `@stackra/ts-container`
    - Implement `register(definition)`, `getAll()`, `get(baseName)`,
      `has(baseName)`, and `findByVariant(variantName)` methods
    - Use `Str` from `@stackra/ts-support` for any string operations
    - Include explicit access modifiers (`public`) on all methods
    - Include full JSDoc docblocks on the class and every method
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 10.2, 10.3, 10.4_

  - [ ]\* 2.2 Write property test: Registry registration round-trip
    - **Property 1: Registry registration round-trip**
    - Create `packages/ui/src/registries/__tests__/theme.registry.test.ts`
    - Use `fast-check` to generate random `ThemeDefinition` objects
    - Verify `register` → `get(baseName)` returns identical fields and
      `has(baseName)` returns `true` for registered / `false` for unregistered
    - **Validates: Requirements 1.2, 1.5, 1.7**

  - [ ]\* 2.3 Write property test: Registry duplicate overwrite
    - **Property 2: Registry duplicate overwrite**
    - Generate pairs of `ThemeDefinition` with same `baseName` but different
      fields
    - Verify `get(baseName)` returns the second definition's values after
      sequential registration
    - **Validates: Requirements 1.3**

  - [ ]\* 2.4 Write property test: Registry getAll completeness
    - **Property 3: Registry getAll completeness**
    - Generate arrays of `ThemeDefinition` with unique `baseName` values
    - Verify `getAll().length` equals the number of registered entries and all
      definitions are present
    - **Validates: Requirements 1.4**

- [ ] 3. Implement ThemeService
  - [ ] 3.1 Create `ThemeService` class in
        `packages/ui/src/services/theme.service.ts`
    - Create the `services/` directory
    - Decorate with `@Injectable()`
    - Accept `ThemeRegistry` as a constructor dependency
    - Implement `currentTheme` getter, `isLight`/`isDark` getters using
      `Str.endsWith`
    - Implement `initialize()` — read from AsyncStorage, fall back to
      `Appearance.getColorScheme()`, apply via `Uniwind.setTheme()`
    - Implement `setTheme(variantName)` — delegate to `Uniwind.setTheme()`,
      persist to AsyncStorage under `@repo/ui:theme`
    - Implement `toggleTheme()` — look up current theme in registry via
      `findByVariant`, switch to opposite variant, fall back to `"dark"`
    - Implement `getCurrentTheme()` alias
    - Use `Str` for all string operations (e.g., `Str.endsWith`)
    - Include explicit access modifiers and full JSDoc docblocks on every member
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.1, 3.2, 3.3,
      3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 10.2, 10.3, 10.4_

  - [ ]\* 3.2 Write property test: setTheme delegates to Uniwind and persists
    - **Property 4: setTheme delegates to Uniwind and persists to AsyncStorage**
    - Generate random variant names, call `setTheme`, verify
      `Uniwind.setTheme()` called with exact name AND AsyncStorage write under
      `@repo/ui:theme`
    - Mock `Uniwind` and `AsyncStorage`
    - **Validates: Requirements 2.2, 2.3, 3.4**

  - [ ]\* 3.3 Write property test: toggleTheme switches to opposite variant
    - **Property 5: toggleTheme switches to opposite variant**
    - Generate registered `ThemeDefinition` + current variant matching one side,
      toggle, verify opposite variant applied
    - **Validates: Requirements 2.4**

  - [ ]\* 3.4 Write property test: isLight and isDark derivation
    - **Property 6: isLight and isDark derivation**
    - Generate random strings, verify `isLight` is `true` iff name equals
      `"light"` or ends with `"-light"`, `isDark` is `true` iff name equals
      `"dark"` or ends with `"-dark"`
    - **Validates: Requirements 2.6, 2.7, 2.8**

  - [ ]\* 3.5 Write property test: Initialization applies persisted theme
    - **Property 7: Initialization applies persisted theme**
    - Generate random variant names, mock AsyncStorage to return them, call
      `initialize()`, verify `Uniwind.setTheme()` called with exact stored value
    - **Validates: Requirements 3.1, 3.2**

- [ ] 4. Checkpoint — Verify registry and service layer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create ThemeFacade and UIModule
  - [ ] 5.1 Create `ThemeFacade` in `packages/ui/src/facades/theme.facade.ts`
    - Create the `facades/` directory
    - Define
      `export const ThemeFacade: ThemeService = Facade.make<ThemeService>(THEME_SERVICE)`
    - Import `Facade` from `@stackra/ts-support`, `ThemeService` from services,
      `THEME_SERVICE` from constants
    - Include full JSDoc docblock
    - _Requirements: 6.1, 6.2, 6.3, 10.1_

  - [ ] 5.2 Create `UIModule` in `packages/ui/src/ui.module.ts`
    - Decorate with `@Module()` from `@stackra/ts-container`
    - Register `ThemeRegistry` and
      `{ provide: THEME_SERVICE, useClass: ThemeService }` as providers
    - Export `ThemeRegistry` and `THEME_SERVICE`
    - Implement static `forFeature(options: ThemeFeatureOptions): DynamicModule`
      that registers each `ThemeDefinition` into the `ThemeRegistry`
    - Include full JSDoc docblocks on the class and `forFeature` method
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.1, 10.3_

  - [ ]\* 5.3 Write property test: forFeature registers all provided definitions
    - **Property 8: forFeature registers all provided definitions**
    - Generate random `ThemeDefinition` arrays, call `forFeature`, resolve DI
      container, verify `ThemeRegistry` contains every definition by `baseName`
    - **Validates: Requirements 5.3**

- [ ] 6. Refactor ThemeProvider to bridge DI → React context
  - [ ] 6.1 Refactor `packages/ui/src/providers/theme-provider.tsx`
    - Remove the hardcoded `THEME_TOGGLE_MAP` constant
    - Read current theme from `useUniwind()` (unchanged)
    - Derive `isLight`/`isDark` using `Str.endsWith` (unchanged logic)
    - Delegate `setTheme` and `toggleTheme` to `ThemeService` via `ThemeFacade`
    - Maintain the existing `AppThemeContextValue` interface so all
      `useAppTheme` consumers continue working
    - Include updated JSDoc docblocks
    - _Requirements: 7.1, 7.2, 7.3, 9.1, 9.3, 9.5, 10.2_

  - [ ]\* 6.2 Write unit tests for ThemeProvider
    - Create `packages/ui/src/providers/__tests__/theme-provider.test.tsx`
    - Test that context value contains all required fields (`currentTheme`,
      `isLight`, `isDark`, `setTheme`, `toggleTheme`)
    - Test that context updates when theme changes
    - Mock `useUniwind`, `ThemeFacade`
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 7. Create ThemeSwitcher component
  - [ ] 7.1 Create `ThemeSwitcher` in
        `packages/ui/src/components/theme-switcher.component.tsx`
    - Create the `components/` directory
    - Read all `ThemeDefinition` entries from `ThemeRegistry` (via `ThemeFacade`
      or a hook)
    - Read current theme state from `useAppTheme()`
    - Render each theme as a selectable card with `label`, `accentColor`
      preview, and active indicator
    - On selection: call `setTheme` with the light or dark variant based on
      current `isLight`/`isDark` mode
    - Contain zero hardcoded theme names — all data from registry
    - Include full JSDoc docblocks
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 10.1, 10.3_

  - [ ]\* 7.2 Write property test: ThemeSwitcher renders all registered themes
    - **Property 9: ThemeSwitcher renders all registered themes with metadata**
    - Generate random `ThemeDefinition` sets, register them, render
      `ThemeSwitcher`, verify all `label` and `accentColor` values appear
    - Use `@testing-library/react-native`
    - **Validates: Requirements 8.1, 8.2, 8.6**

  - [ ]\* 7.3 Write property test: ThemeSwitcher selects correct variant
    - **Property 10: ThemeSwitcher selects correct variant based on current
      mode**
    - Generate random `ThemeDefinition` + light/dark state, simulate selection,
      verify `setTheme` called with correct variant
    - **Validates: Requirements 8.4**

- [ ] 8. Checkpoint — Verify all packages/ui components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Update barrel exports and app-level wiring
  - [ ] 9.1 Update `packages/ui/src/index.tsx` barrel exports
    - Add section headers and exports for: `ThemeDefinition`,
      `ThemeFeatureOptions`, `THEME_SERVICE`, `ThemeRegistry`, `ThemeService`,
      `ThemeFacade`, `UIModule`, `ThemeSwitcher`
    - Use `export type` for type-only exports
    - _Requirements: 10.6_

  - [ ] 9.2 Update `apps/native/src/app.module.ts` to import
        `UIModule.forFeature()`
    - Import `UIModule` from `@repo/ui`
    - Add `UIModule.forFeature({ themes: [...] })` to the module imports with
      the four default theme definitions (default, lavender, mint, sky)
      including `baseName`, `label`, `icon`, `accentColor`, and `variants`
    - _Requirements: 5.4_

  - [ ] 9.3 Update `apps/native/src/app/_layout.tsx` to render `ThemeProvider`
    - Ensure `ThemeProvider` from `@repo/ui` wraps the `Slot` inside
      `AppContent` (after `ContainerProvider` and `HeroUINativeProvider`)
    - Remove the unused `ThemeProvider` import if it's already imported but not
      used, and wire it into the JSX tree
    - _Requirements: 7.1_

  - [ ] 9.4 Refactor `apps/native/src/screens/settings/index.tsx` to use
        `ThemeSwitcher`
    - Remove the hardcoded `THEME_TOGGLE_MAP` constant and static theme button
      list
    - Import `ThemeSwitcher` from `@repo/ui`
    - Replace the manual theme selector card with `<ThemeSwitcher />`
    - Keep the appearance toggle card using `useAppTheme().toggleTheme`
    - Import `useAppTheme` from `@repo/ui` instead of using `useUniwind`
      directly
    - _Requirements: 9.2, 9.4_

- [ ] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document
- Unit tests validate specific examples and edge cases
- The `useAppTheme` hook and `AppThemeContext` are unchanged — no tasks needed
  for them
- `bootstrap.ts` already calls `Facade.setApplication(app)` — no changes needed
  there
