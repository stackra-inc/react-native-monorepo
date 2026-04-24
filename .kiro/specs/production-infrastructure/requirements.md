# Requirements Document

## Introduction

This specification covers making the React Native / Expo monorepo
production-ready. The scope spans four phases: pre-build housekeeping (README,
entitlements, environment management, EAS submit documentation), CI/CD pipeline
creation (GitHub Actions for lint/test, EAS Build, EAS Submit), observability
(Sentry error tracking, OTA updates), and store submission preparation (privacy
policy, signing documentation, metadata checklists). Business logic is
explicitly out of scope.

## Glossary

- **Monorepo**: The Turborepo-managed npm workspace containing `apps/native` and
  `packages/ui`
- **CI_Pipeline**: The GitHub Actions continuous integration workflow that runs
  lint, type-check, and test on pull requests
- **Build_Pipeline**: The GitHub Actions workflow that triggers EAS Build on
  merges to the main branch
- **Deploy_Pipeline**: The GitHub Actions workflow that triggers EAS Submit to
  TestFlight and Google Play internal track
- **EAS**: Expo Application Services — cloud build and submission infrastructure
- **EAS_Submit**: The EAS service that uploads built binaries to Apple App Store
  Connect and Google Play Console
- **OTA_Update**: Over-the-air update delivered via EAS Update without requiring
  a new store binary
- **Sentry_SDK**: The `@sentry/react-native` library used for crash reporting
  and error tracking
- **README**: The root `README.md` file documenting project setup and usage
- **Entitlements_File**: The iOS `HeroUINative.entitlements` plist that declares
  app capabilities
- **Env_Example**: The `.env.example` file documenting all required environment
  variables
- **Submit_Config**: The `submit` section of `apps/native/eas.json` containing
  Apple and Google credentials
- **Branch_Protection_Doc**: Documentation describing recommended GitHub branch
  protection rules
- **Metadata_Checklist**: A document listing all assets and information required
  for App Store and Play Store submission
- **Signing_Doc**: Documentation describing iOS and Android code signing setup
  for production builds

---

## Requirements

### Requirement 1: Update README to Reflect npm Workspaces

**User Story:** As a contributor, I want the README to accurately reference npm
instead of pnpm, so that setup instructions work without confusion.

#### Acceptance Criteria

1. THE README SHALL replace all references to `pnpm` commands with equivalent
   `npm` commands
2. THE README SHALL replace the `pnpm-workspace.yaml` reference in the project
   structure with `package.json` workspaces configuration
3. THE README SHALL update the Prerequisites section to list `npm` instead of
   `pnpm >= 10`
4. THE README SHALL update the Tech Stack section to reference `npm workspaces`
   instead of `pnpm workspaces`
5. THE README SHALL update the Makefile reference in the Prerequisites section
   to list `npm` instead of `bun`
6. WHEN a contributor follows the Quick Start instructions, THE README SHALL
   provide commands that execute successfully with npm

### Requirement 2: Complete iOS Entitlements File

**User Story:** As a mobile developer, I want the iOS entitlements file to
declare capabilities matching the app's configured features, so that iOS builds
include the correct permissions.

#### Acceptance Criteria

1. THE Entitlements_File SHALL declare the
   `com.apple.developer.associated-domains` entitlement for deep linking via the
   `herouinative` URL scheme configured in `app.json`
2. WHEN the app uses `expo-splash-screen` with `checkAutomatically: "ON_LOAD"`
   for OTA updates, THE Entitlements_File SHALL include the `aps-environment`
   entitlement set to `development` for debug builds and `production` for
   release builds
3. THE Entitlements_File SHALL include a file-level XML comment documenting each
   entitlement's purpose and which `app.json` feature requires the entitlement

### Requirement 3: Create Environment Variable Documentation

**User Story:** As a developer, I want a `.env.example` file listing all
required environment variables, so that I can configure the project without
guessing what values are needed.

#### Acceptance Criteria

1. THE Env_Example SHALL be created at the monorepo root as `.env.example`
2. THE Env_Example SHALL list every environment variable referenced in
   `eas.json`, `app.json`, and application source code with a placeholder value
3. THE Env_Example SHALL include `EXPO_PROJECT_ID` corresponding to the
   `YOUR_PROJECT_ID` placeholder in `app.json`
4. THE Env_Example SHALL include `EXPO_OWNER` corresponding to the
   `YOUR_EXPO_OWNER` placeholder in `app.json`
5. THE Env_Example SHALL include `SENTRY_DSN` for error tracking integration
6. THE Env_Example SHALL include `APP_ENV` with a default value of `development`
7. THE Env_Example SHALL group variables by category with inline comments
   explaining each variable's purpose and where to obtain its value
8. THE Env_Example SHALL include `SENTRY_AUTH_TOKEN` for source map uploads
   during CI builds

### Requirement 4: Document EAS Submit Configuration

**User Story:** As a release engineer, I want clear documentation on what EAS
Submit credentials are needed and how to obtain them, so that store submissions
can be configured without trial and error.

#### Acceptance Criteria

1. THE Submit_Config documentation SHALL be created as
   `apps/native/docs/eas-submit-setup.md`
2. THE Submit_Config documentation SHALL list each placeholder in `eas.json`
   submit section (`YOUR_APPLE_ID`, `YOUR_ASC_APP_ID`, `YOUR_TEAM_ID`) with a
   description of what the value represents
3. THE Submit_Config documentation SHALL provide step-by-step instructions for
   obtaining each Apple credential from App Store Connect
4. THE Submit_Config documentation SHALL provide step-by-step instructions for
   creating the Google Play service account JSON key file referenced as
   `./google-services.json`
5. THE Submit_Config documentation SHALL document the `track: "internal"` and
   `releaseStatus: "draft"` Android settings and how to change them for wider
   releases

### Requirement 5: Create CI Pipeline Workflow

**User Story:** As a developer, I want automated lint, type-check, and test runs
on every pull request, so that code quality issues are caught before merge.

#### Acceptance Criteria

1. THE CI_Pipeline SHALL be defined in `.github/workflows/ci.yml`
2. WHEN a pull request is opened or updated against the `main` branch, THE
   CI_Pipeline SHALL trigger automatically
3. THE CI_Pipeline SHALL run `npm run lint` across all workspace packages
4. THE CI_Pipeline SHALL run `npm run check-types` across all workspace packages
5. THE CI_Pipeline SHALL run `npm run test` across all workspace packages
6. THE CI_Pipeline SHALL use Node.js version 22 matching the `node` version in
   `eas.json` base build profile
7. THE CI_Pipeline SHALL cache `node_modules` using npm's cache directory to
   reduce install time
8. THE CI_Pipeline SHALL use Turborepo remote caching when the `TURBO_TOKEN` and
   `TURBO_TEAM` environment variables are available
9. IF any lint, type-check, or test step fails, THEN THE CI_Pipeline SHALL
   report the failure and prevent the workflow from succeeding
10. THE CI_Pipeline SHALL include comprehensive YAML comments explaining each
    step's purpose following the project's documentation standards

### Requirement 6: Create Build Pipeline Workflow

**User Story:** As a release engineer, I want EAS Build to trigger automatically
when code merges to main, so that fresh binaries are always available for
testing.

#### Acceptance Criteria

1. THE Build_Pipeline SHALL be defined in `.github/workflows/build.yml`
2. WHEN a push occurs to the `main` branch, THE Build_Pipeline SHALL trigger
   automatically
3. THE Build_Pipeline SHALL also support manual triggering via
   `workflow_dispatch` with a selectable build profile (`development`,
   `preview`, `production`) and platform (`ios`, `android`, `all`)
4. THE Build_Pipeline SHALL run `eas build` for both iOS and Android platforms
   using the `preview` profile for automatic triggers
5. THE Build_Pipeline SHALL authenticate with Expo using the `EXPO_TOKEN` secret
6. THE Build_Pipeline SHALL include comprehensive YAML comments explaining each
   step's purpose following the project's documentation standards
7. IF the EAS Build command fails, THEN THE Build_Pipeline SHALL report the
   failure with the EAS build URL for debugging

### Requirement 7: Create Deploy Pipeline Workflow

**User Story:** As a release engineer, I want a workflow that submits built
binaries to TestFlight and Google Play, so that testers receive new builds
without manual uploads.

#### Acceptance Criteria

1. THE Deploy_Pipeline SHALL be defined in `.github/workflows/deploy.yml`
2. THE Deploy_Pipeline SHALL support manual triggering via `workflow_dispatch`
   with a selectable platform (`ios`, `android`, `all`)
3. THE Deploy_Pipeline SHALL run `eas submit` for the selected platform using
   the `production` submit profile
4. THE Deploy_Pipeline SHALL authenticate with Expo using the `EXPO_TOKEN`
   secret
5. THE Deploy_Pipeline SHALL include comprehensive YAML comments explaining each
   step's purpose following the project's documentation standards
6. IF the EAS Submit command fails, THEN THE Deploy_Pipeline SHALL report the
   failure with actionable error context

### Requirement 8: Document Branch Protection Rules

**User Story:** As a team lead, I want documented branch protection rules, so
that the team can configure GitHub to enforce quality gates consistently.

#### Acceptance Criteria

1. THE Branch_Protection_Doc SHALL be created as `docs/branch-protection.md`
2. THE Branch_Protection_Doc SHALL recommend requiring the CI_Pipeline status
   check to pass before merging to `main`
3. THE Branch_Protection_Doc SHALL recommend requiring at least one pull request
   review before merging
4. THE Branch_Protection_Doc SHALL recommend disabling direct pushes to `main`
5. THE Branch_Protection_Doc SHALL provide step-by-step GitHub UI instructions
   for configuring each rule
6. THE Branch_Protection_Doc SHALL recommend requiring linear history (squash or
   rebase merges)

### Requirement 9: Integrate Sentry Error Tracking

**User Story:** As a developer, I want runtime errors and crashes reported to
Sentry, so that production issues are detected and diagnosed quickly.

#### Acceptance Criteria

1. WHEN the application starts, THE Sentry_SDK SHALL initialize with the DSN
   provided via the `SENTRY_DSN` environment variable
2. THE Sentry_SDK integration SHALL wrap the root Expo Router layout with
   `Sentry.wrap()` to capture navigation breadcrumbs
3. WHEN an unhandled JavaScript exception occurs, THE Sentry_SDK SHALL capture
   and report the exception with a stack trace
4. WHEN a native crash occurs on iOS or Android, THE Sentry_SDK SHALL capture
   and report the crash
5. THE Sentry_SDK SHALL tag each event with the `APP_ENV` value (`development`,
   `preview`, `production`) to distinguish environments
6. THE Sentry_SDK SHALL be configured as an Expo plugin in `app.json` to enable
   native crash reporting and source map uploads
7. THE Sentry_SDK integration SHALL include comprehensive JSDoc docblocks and
   inline comments following the project's documentation standards
8. WHILE `APP_ENV` is set to `development`, THE Sentry_SDK SHALL set
   `debug: true` to log SDK diagnostics to the console
9. THE Build_Pipeline SHALL upload source maps to Sentry during EAS Build using
   the `SENTRY_AUTH_TOKEN` and `SENTRY_ORG` and `SENTRY_PROJECT` environment
   variables

### Requirement 10: Configure OTA Updates

**User Story:** As a release engineer, I want OTA updates configured with proper
channels, so that JavaScript-only fixes can be pushed to users without a new
store build.

#### Acceptance Criteria

1. THE `app.json` updates configuration SHALL reference the actual Expo project
   ID instead of the `YOUR_PROJECT_ID` placeholder once the project is created
   on expo.dev
2. THE `eas.json` channel configuration SHALL map `development` builds to the
   `development` channel, `preview` builds to the `preview` channel, and
   `production` builds to the `production` channel (already configured)
3. THE OTA update documentation SHALL be created as
   `apps/native/docs/ota-updates.md` explaining how to publish updates to each
   channel using `eas update`
4. THE OTA update documentation SHALL explain the `runtimeVersion` policy
   (`appVersion`) and when a new binary build is required versus when an OTA
   update suffices
5. THE OTA update documentation SHALL include example commands for publishing
   updates to each channel

### Requirement 11: Create Privacy Policy URL Placeholder

**User Story:** As a release engineer, I want a privacy policy placeholder
documented, so that the team knows a privacy policy URL is required before store
submission.

#### Acceptance Criteria

1. THE Metadata_Checklist SHALL include a line item for the privacy policy URL
   with a note that Apple and Google both require a publicly accessible privacy
   policy before app review
2. THE `app.json` SHALL not include a `privacyUrl` field until a real URL is
   available, to avoid submitting a broken link
3. THE Metadata_Checklist SHALL note that the privacy policy must cover data
   collected by Sentry (crash reports, device info) and any analytics services

### Requirement 12: Document Code Signing for Production

**User Story:** As a release engineer, I want documentation on iOS and Android
code signing, so that production builds can be signed correctly for store
distribution.

#### Acceptance Criteria

1. THE Signing_Doc SHALL be created as `apps/native/docs/code-signing.md`
2. THE Signing_Doc SHALL explain EAS Build's managed signing for iOS (automatic
   provisioning profile and certificate management)
3. THE Signing_Doc SHALL explain how to generate an Android upload keystore for
   Google Play and how to configure EAS Build to use the keystore
4. THE Signing_Doc SHALL document the `credentials.json` approach for storing
   Android keystore credentials in EAS
5. THE Signing_Doc SHALL warn against committing keystores or signing
   credentials to version control
6. THE Signing_Doc SHALL include comprehensive inline comments and section
   headers following the project's documentation standards

### Requirement 13: Create Store Submission Metadata Checklist

**User Story:** As a release engineer, I want a checklist of all assets and
information required for App Store and Play Store submission, so that nothing is
missed during the first release.

#### Acceptance Criteria

1. THE Metadata_Checklist SHALL be created as
   `apps/native/docs/store-submission-checklist.md`
2. THE Metadata_Checklist SHALL list all required App Store Connect metadata:
   app name, subtitle, description, keywords, categories, screenshots (6.7",
   6.5", 5.5" iPhones and iPad), app icon (1024×1024), age rating, and review
   contact information
3. THE Metadata_Checklist SHALL list all required Google Play Console metadata:
   title, short description, full description, screenshots (phone, 7" tablet,
   10" tablet), feature graphic (1024×500), app icon (512×512), content rating
   questionnaire, and target audience
4. THE Metadata_Checklist SHALL include a section for common rejection reasons
   and how to avoid them
5. THE Metadata_Checklist SHALL include checkbox-style formatting so the team
   can track completion
6. THE Metadata_Checklist SHALL reference the privacy policy requirement from
   Requirement 11

### Requirement 14: Update Makefile to Use npm

**User Story:** As a contributor, I want the Makefile to use npm commands
instead of bun, so that the build shortcuts match the project's actual package
manager.

#### Acceptance Criteria

1. THE Makefile SHALL replace all `bun` command references with equivalent `npm`
   commands
2. THE Makefile SHALL update the Prerequisites comment to reference `npm`
   instead of `bun`
3. THE Makefile SHALL update the `info` target to display `npm --version`
   instead of `bun --version`
