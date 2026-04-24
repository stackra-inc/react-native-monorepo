# Requirements Document

## Introduction

The Theme Management System replaces the current hardcoded theme infrastructure
in the React Native monorepo with a dynamic, registry-driven architecture.
Today, theme lists are duplicated across `ThemeProvider` and `SettingsScreen` as
static `THEME_TOGGLE_MAP` objects, themes cannot be added at runtime, and the
user's theme choice is lost on app restart. This feature introduces an
injectable `ThemeService`, a `ThemeRegistry` built on `BaseRegistry`, a
`UIModule` with `forFeature()` for declarative theme registration,
AsyncStorage-based persistence, system color scheme detection, and a data-driven
theme switcher component — all following `@stackra` DI conventions (injectable
services, facades, modules, kebab-case file naming, full JSDoc docblocks, and
`Str` for string manipulation).

## Glossary

- **ThemeService**: An `@Injectable()` service in `packages/ui` that manages the
  active theme state, delegates to Uniwind for runtime CSS variable switching,
  persists the user's choice to AsyncStorage, and exposes the current theme to
  React components via context.
- **ThemeRegistry**: A registry class extending `BaseRegistry` from
  `@stackra/ts-support` that stores `ThemeDefinition` entries keyed by base
  theme name. Supports dynamic registration and enumeration of all available
  themes.
- **ThemeDefinition**: A data object describing a single theme family, including
  its base name, display label, icon identifier, accent color preview value, and
  the light/dark variant pair.
- **ThemeFacade**: A typed constant created via
  `Facade.make<ThemeService>(THEME_SERVICE)` providing static-style access to
  the DI-resolved `ThemeService`.
- **UIModule**: The DI module for `packages/ui` decorated with `@Module()`.
  Provides a static `forFeature()` method that accepts a `ThemeFeatureOptions`
  object containing an array of `ThemeDefinition` entries and registers them
  into the `ThemeRegistry`.
- **ThemeFeatureOptions**: The configuration object passed to
  `UIModule.forFeature()`, containing a `themes` array of `ThemeDefinition`
  entries to register.
- **ThemeSwitcher**: A React component that reads all registered themes from the
  `ThemeRegistry` and renders selectable theme options dynamically — no
  hardcoded theme lists.
- **Uniwind**: The Tailwind CSS v4 runtime for React Native that manages CSS
  variable themes via `@variant` blocks in `global.css` and exposes
  `Uniwind.setTheme()` for runtime switching.
- **AsyncStorage**: The React Native async key-value storage API used to persist
  the user's selected theme across app restarts.
- **System_Color_Scheme**: The device-level light or dark appearance preference
  reported by the operating system via React Native's `Appearance` API.
- **Base_Theme_Name**: The root identifier for a theme family (e.g.,
  `"lavender"`, `"mint"`), distinct from its variant names (e.g.,
  `"lavender-light"`, `"lavender-dark"`).
- **Theme_Variant**: A specific light or dark instantiation of a base theme,
  identified by a name like `"lavender-dark"` and corresponding to a `@variant`
  block in CSS.

## Requirements

### Requirement 1: Theme Registry

**User Story:** As a developer, I want a centralized registry of all available
themes with metadata, so that UI components can discover and display themes
dynamically without hardcoded lists.

#### Acceptance Criteria

1. THE ThemeRegistry SHALL extend `BaseRegistry` from `@stackra/ts-support` and
   store `ThemeDefinition` entries keyed by Base_Theme_Name.
2. WHEN a `ThemeDefinition` is registered, THE ThemeRegistry SHALL store the
   entry's base name, display label, icon identifier, accent color preview, and
   light/dark Theme_Variant pair.
3. WHEN a `ThemeDefinition` with a duplicate Base_Theme_Name is registered, THE
   ThemeRegistry SHALL overwrite the existing entry with the new definition.
4. THE ThemeRegistry SHALL provide a method to retrieve all registered
   `ThemeDefinition` entries as an array.
5. THE ThemeRegistry SHALL provide a method to retrieve a single
   `ThemeDefinition` by its Base_Theme_Name.
6. WHEN a `ThemeDefinition` is requested by a Base_Theme_Name that does not
   exist, THE ThemeRegistry SHALL return `undefined`.
7. THE ThemeRegistry SHALL provide a method to check whether a given
   Base_Theme_Name is registered.
8. THE ThemeRegistry SHALL be decorated with `@Injectable()` so it can be
   resolved through the DI container.

### Requirement 2: Theme Service

**User Story:** As a developer, I want an injectable service that manages theme
state, switching, and persistence, so that theme logic is centralized and
testable outside of React components.

#### Acceptance Criteria

1. THE ThemeService SHALL be decorated with `@Injectable()` and accept
   ThemeRegistry as a constructor dependency.
2. WHEN `setTheme` is called with a valid Theme_Variant name, THE ThemeService
   SHALL delegate to `Uniwind.setTheme()` to apply the CSS variable theme at
   runtime.
3. WHEN `setTheme` is called with a valid Theme_Variant name, THE ThemeService
   SHALL persist the selected Theme_Variant name to AsyncStorage under a defined
   storage key.
4. WHEN `toggleTheme` is called, THE ThemeService SHALL look up the current
   theme's Base_Theme_Name in the ThemeRegistry, find the opposite variant
   (light to dark or dark to light), and apply it via `Uniwind.setTheme()`.
5. IF `toggleTheme` is called and the current theme is not found in the
   ThemeRegistry, THEN THE ThemeService SHALL fall back to the `"dark"` variant.
6. THE ThemeService SHALL expose the current theme name, an `isLight` flag, and
   an `isDark` flag as observable state.
7. THE ThemeService SHALL determine `isLight` by checking whether the current
   theme name equals `"light"` or ends with `"-light"` using `Str.endsWith`.
8. THE ThemeService SHALL determine `isDark` by checking whether the current
   theme name equals `"dark"` or ends with `"-dark"` using `Str.endsWith`.
9. WHEN `setTheme` is called, THE ThemeService SHALL persist the theme choice to
   AsyncStorage within 100ms of the call.

### Requirement 3: Theme Persistence

**User Story:** As a user, I want my theme choice to be remembered across app
restarts, so that I do not have to re-select my preferred theme every time I
open the app.

#### Acceptance Criteria

1. WHEN the ThemeService initializes, THE ThemeService SHALL read the persisted
   theme name from AsyncStorage.
2. WHEN a persisted theme name exists in AsyncStorage, THE ThemeService SHALL
   apply that theme via `Uniwind.setTheme()` during initialization.
3. WHEN no persisted theme name exists in AsyncStorage, THE ThemeService SHALL
   defer to the System_Color_Scheme detection logic for the initial theme.
4. WHEN `setTheme` is called, THE ThemeService SHALL write the new Theme_Variant
   name to AsyncStorage.
5. IF AsyncStorage read fails during initialization, THEN THE ThemeService SHALL
   log the error and fall back to System_Color_Scheme detection.
6. IF AsyncStorage write fails during persistence, THEN THE ThemeService SHALL
   log the error and continue operating with the in-memory theme state.

### Requirement 4: System Color Scheme Detection

**User Story:** As a user, I want the app to respect my device's light or dark
mode preference on first launch, so that the app matches my system appearance
without manual configuration.

#### Acceptance Criteria

1. WHEN no persisted theme exists in AsyncStorage, THE ThemeService SHALL read
   the device's System_Color_Scheme via React Native's
   `Appearance.getColorScheme()`.
2. WHEN the System_Color_Scheme is `"dark"`, THE ThemeService SHALL apply the
   `"dark"` theme as the initial theme.
3. WHEN the System_Color_Scheme is `"light"` or `null`, THE ThemeService SHALL
   apply the `"light"` theme as the initial theme.

### Requirement 5: UIModule with forFeature

**User Story:** As a developer, I want to register custom themes declaratively
via the DI module pattern, so that each app or feature module can contribute its
own themes without modifying shared library code.

#### Acceptance Criteria

1. THE UIModule SHALL be decorated with `@Module()` and provide ThemeService and
   ThemeRegistry as providers.
2. THE UIModule SHALL expose a static `forFeature()` method that accepts a
   `ThemeFeatureOptions` object containing a `themes` array of `ThemeDefinition`
   entries.
3. WHEN `forFeature()` is called, THE UIModule SHALL return a dynamic module
   configuration that registers each `ThemeDefinition` from the `themes` array
   into the ThemeRegistry.
4. WHEN `AppModule` imports `UIModule.forFeature({ themes: [...] })`, THE DI
   container SHALL resolve the ThemeRegistry with all provided themes
   registered.
5. THE UIModule SHALL export ThemeService and ThemeRegistry so that other
   modules can inject them.

### Requirement 6: Theme Facade

**User Story:** As a developer, I want static-style access to the ThemeService
without manually resolving from the DI container, so that non-React code can
interact with the theme system conveniently.

#### Acceptance Criteria

1. THE ThemeFacade SHALL be a typed constant created via
   `Facade.make<ThemeService>(THEME_SERVICE)`.
2. THE ThemeFacade SHALL expose all public methods of ThemeService (setTheme,
   toggleTheme, getCurrentTheme) through the proxy.
3. WHEN `Facade.setApplication(app)` has been called during bootstrap, THE
   ThemeFacade SHALL resolve to the DI-managed ThemeService instance.

### Requirement 7: Theme Context and Hook Integration

**User Story:** As a React developer, I want to consume theme state via a React
context and hook, so that components can reactively update when the theme
changes.

#### Acceptance Criteria

1. THE ThemeProvider SHALL read theme state from the ThemeService and provide it
   to the component tree via `AppThemeContext`.
2. THE ThemeProvider SHALL provide `currentTheme`, `isLight`, `isDark`,
   `setTheme`, and `toggleTheme` through the context value.
3. WHEN the active theme changes via ThemeService, THE ThemeProvider SHALL
   update the context value so that consuming components re-render.
4. THE `useAppTheme` hook SHALL return the `AppThemeContextValue` from the
   nearest `ThemeProvider`.
5. IF `useAppTheme` is called outside of a `ThemeProvider`, THEN THE
   `useAppTheme` hook SHALL throw an error with a descriptive message.

### Requirement 8: Dynamic Theme Switcher Component

**User Story:** As a user, I want to see all available themes in the settings
screen and switch between them, so that I can personalize the app's appearance.

#### Acceptance Criteria

1. THE ThemeSwitcher SHALL read all registered themes from the ThemeRegistry to
   render the list of available themes.
2. THE ThemeSwitcher SHALL display each theme's label and accent color preview
   as provided by the `ThemeDefinition`.
3. THE ThemeSwitcher SHALL visually indicate which theme is currently active.
4. WHEN the user selects a theme, THE ThemeSwitcher SHALL call
   `ThemeService.setTheme()` with the appropriate Theme_Variant based on the
   current light/dark mode.
5. THE ThemeSwitcher SHALL contain zero hardcoded theme names or theme lists —
   all data comes from the ThemeRegistry.
6. WHEN a new theme is registered in the ThemeRegistry via
   `UIModule.forFeature()`, THE ThemeSwitcher SHALL display the new theme
   without code changes to the component.

### Requirement 9: Refactor Existing Hardcoded Theme Infrastructure

**User Story:** As a developer, I want to remove all hardcoded
`THEME_TOGGLE_MAP` objects and static theme button lists, so that the codebase
has a single source of truth for theme data.

#### Acceptance Criteria

1. WHEN the refactoring is complete, THE ThemeProvider SHALL no longer contain a
   hardcoded `THEME_TOGGLE_MAP` constant.
2. WHEN the refactoring is complete, THE SettingsScreen SHALL no longer contain
   a hardcoded `THEME_TOGGLE_MAP` constant or static theme button list.
3. WHEN the refactoring is complete, THE ThemeProvider SHALL delegate theme
   toggling logic to the ThemeService instead of implementing it inline.
4. WHEN the refactoring is complete, THE SettingsScreen SHALL use the
   ThemeSwitcher component for theme selection instead of manually rendered
   buttons.
5. THE refactored ThemeProvider SHALL maintain the same `AppThemeContextValue`
   interface so that existing consumers of `useAppTheme` continue to work
   without changes.

### Requirement 10: File and Code Conventions

**User Story:** As a developer, I want all new theme system files to follow the
established `@stackra` conventions, so that the codebase remains consistent and
maintainable.

#### Acceptance Criteria

1. THE theme system SHALL use kebab-case file names with appropriate suffixes:
   `.service.ts`, `.registry.ts`, `.module.ts`, `.facade.ts`, `.type.ts`,
   `.context.ts`, `.hook.ts`, and `.component.tsx`.
2. THE theme system SHALL use `Str` from `@stackra/ts-support` for all string
   manipulation operations instead of native string methods.
3. THE theme system SHALL include full JSDoc docblocks on every exported class,
   interface, type, method, property, and constant following the
   docblocks-and-comments standard.
4. THE theme system SHALL use explicit TypeScript access modifiers (`public`,
   `private`, `protected`) on all class members.
5. THE theme system SHALL use `import type` for type-only imports.
6. THE theme system SHALL export all new public symbols from the
   `packages/ui/src/index.tsx` barrel with section headers.
