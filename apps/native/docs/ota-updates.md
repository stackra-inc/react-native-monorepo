# OTA Updates (EAS Update)

Over-the-air (OTA) updates allow you to push JavaScript and asset changes to
users without submitting a new binary to the App Store or Google Play.

---

## Table of Contents

- [How Channels Work](#how-channels-work)
- [Runtime Version Policy](#runtime-version-policy)
- [Publishing Updates](#publishing-updates)
- [Binary Build vs OTA Update](#binary-build-vs-ota-update)
- [Rollback](#rollback)

---

## How Channels Work

Each EAS Build profile is mapped to a **channel** in `eas.json`. When you
publish an OTA update, it targets a specific channel. Only builds created with
that channel will receive the update.

| Build Profile | Channel       | Purpose                                |
| ------------- | ------------- | -------------------------------------- |
| `development` | `development` | Local dev builds (simulators, devices) |
| `preview`     | `preview`     | Internal QA / stakeholder testing      |
| `production`  | `production`  | App Store / Play Store release builds  |

This separation ensures that a production OTA update never reaches a development
build, and vice versa.

### How the App Receives Updates

The `app.json` configuration controls update behavior:

```json
"updates": {
  "enabled": true,
  "fallbackToCacheTimeout": 0,
  "checkAutomatically": "ON_LOAD",
  "url": "https://u.expo.dev/YOUR_PROJECT_ID"
}
```

- `checkAutomatically: "ON_LOAD"` — the app checks for updates every time it
  launches. If an update is available, it downloads in the background and
  applies on the next launch.
- `fallbackToCacheTimeout: 0` — the app launches immediately with the cached
  bundle (no blocking wait for updates).

---

## Runtime Version Policy

The `runtimeVersion` in `app.json` determines which OTA updates are compatible
with which binary builds:

```json
"runtimeVersion": {
  "policy": "appVersion"
}
```

With the `appVersion` policy:

- The runtime version is derived from the app's `version` field (e.g. `1.0.0`).
- An OTA update published for runtime version `1.0.0` will only be delivered to
  builds that were created with version `1.0.0`.
- If you bump the version to `1.1.0`, you need a new binary build — old OTA
  updates for `1.0.0` won't apply to `1.1.0` builds.

This prevents incompatible JavaScript bundles from running on older native
binaries that may not have the required native modules.

---

## Publishing Updates

### Publish to a Specific Channel

```bash
cd apps/native

# Publish to the development channel
eas update --channel development --message "Fix login button alignment"

# Publish to the preview channel
eas update --channel preview --message "Add onboarding flow"

# Publish to the production channel
eas update --channel production --message "Hotfix: crash on settings screen"
```

### Publish to a Specific Branch

You can also target a branch name (branches map to channels):

```bash
# Publish to a branch (creates it if it doesn't exist)
eas update --branch preview --message "QA build with new feature"
```

### Publish for a Specific Platform

```bash
# iOS only
eas update --channel production --platform ios --message "iOS-specific fix"

# Android only
eas update --channel production --platform android --message "Android-specific fix"
```

### View Published Updates

```bash
# List recent updates
eas update:list

# View details of a specific update group
eas update:view <update-group-id>
```

---

## Binary Build vs OTA Update

| Change Type                          | Delivery Method | Why                                                |
| ------------------------------------ | --------------- | -------------------------------------------------- |
| JavaScript / TypeScript code changes | OTA Update      | JS bundle is replaced without native rebuild       |
| Asset changes (images, fonts)        | OTA Update      | Assets are bundled with the JS update              |
| New native module added              | Binary Build    | Native code must be compiled into the binary       |
| Native module version bumped         | Binary Build    | Native binary must include the updated native code |
| `app.json` native config changed     | Binary Build    | Changes to iOS/Android config require a new binary |
| Expo SDK version upgrade             | Binary Build    | SDK upgrades include native changes                |
| `version` field bumped in app.json   | Binary Build    | Runtime version changes, so a new binary is needed |
| Expo config plugin added/changed     | Binary Build    | Plugins modify native project files at build time  |

### Rule of Thumb

> If you changed anything that affects the **native layer** (native modules,
> `app.json` native config, Expo SDK version, or the `version` field), you need
> a **new binary build**. Everything else can go as an **OTA update**.

---

## Rollback

If an OTA update causes issues, you can roll back by publishing a new update
with the previous code:

```bash
# Option 1: Publish the previous commit as a new update
git checkout <previous-commit>
eas update --channel production --message "Rollback: revert broken update"

# Option 2: Use EAS Update rollback (if available)
eas update:rollback --channel production
```

The rollback update will be delivered to users on their next app launch.
