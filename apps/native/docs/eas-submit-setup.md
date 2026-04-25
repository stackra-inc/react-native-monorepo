# EAS Submit Setup Guide

This document explains how to configure the credentials needed for `eas submit`
to upload builds to the App Store and Google Play.

The submit configuration lives in `eas.json` under the `submit` key.

---

## Table of Contents

- [Apple (iOS) Configuration](#apple-ios-configuration)
  - [Placeholder Reference](#placeholder-reference)
  - [Step-by-Step: Get Apple Credentials](#step-by-step-get-apple-credentials)
- [Google Play (Android) Configuration](#google-play-android-configuration)
  - [Step-by-Step: Create Service Account](#step-by-step-create-service-account)
- [Android Release Settings](#android-release-settings)
- [Testing Your Configuration](#testing-your-configuration)

---

## Apple (iOS) Configuration

### Placeholder Reference

The `eas.json` file contains three placeholders under `submit.production.ios`:

| Placeholder       | Description                                                                                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `YOUR_APPLE_ID`   | Your Apple ID email address used to sign in to App Store Connect (e.g. `developer@example.com`).                                                                                                                |
| `YOUR_ASC_APP_ID` | The numeric App Store Connect App ID. This is the unique identifier for your app in Apple's system (not the bundle ID). Found in the App Store Connect URL or General > App Information. Example: `1234567890`. |
| `YOUR_TEAM_ID`    | Your Apple Developer Team ID. A 10-character alphanumeric string (e.g. `A1B2C3D4E5`). Found in your Apple Developer account under Membership Details.                                                           |

### Step-by-Step: Get Apple Credentials

1. **Apple ID (`YOUR_APPLE_ID`)**
   - This is the email address you use to sign in at
     [App Store Connect](https://appstoreconnect.apple.com).
   - The account must have the Admin or App Manager role for the app.

2. **App Store Connect App ID (`YOUR_ASC_APP_ID`)**
   1. Sign in to [App Store Connect](https://appstoreconnect.apple.com).
   2. Navigate to **My Apps** and select your app (or create a new app first).
   3. Go to **General** → **App Information**.
   4. Find the **Apple ID** field — this is the numeric ASC App ID.
   5. Alternatively, look at the URL:
      `https://appstoreconnect.apple.com/apps/<ASC_APP_ID>/...`

3. **Team ID (`YOUR_TEAM_ID`)**
   1. Sign in to the
      [Apple Developer Portal](https://developer.apple.com/account).
   2. Navigate to **Membership Details** (or **Account** → **Membership**).
   3. Copy the **Team ID** value (10-character alphanumeric string).

4. **Update `eas.json`**
   - Replace the placeholders in `submit.production.ios` with your actual
     values:
     ```json
     "ios": {
       "appleId": "developer@example.com",
       "ascAppId": "1234567890",
       "appleTeamId": "A1B2C3D4E5"
     }
     ```

5. **App-Specific Password (if using 2FA)**
   - If your Apple ID has two-factor authentication enabled, you may need an
     app-specific password. EAS will prompt you, or you can set it via:
     ```bash
     eas secret:create --name EXPO_APPLE_APP_SPECIFIC_PASSWORD --value "xxxx-xxxx-xxxx-xxxx"
     ```
   - Generate one at [appleid.apple.com](https://appleid.apple.com) → Security →
     App-Specific Passwords.

---

## Google Play (Android) Configuration

The Android submit config references a service account JSON key file at
`./google-services.json`. This file authenticates EAS with the Google Play
Console API.

### Step-by-Step: Create Service Account

1. **Open Google Cloud Console**
   1. Go to [Google Cloud Console](https://console.cloud.google.com).
   2. Select the project linked to your Google Play Console (or create one).

2. **Enable the Google Play Android Developer API**
   1. Navigate to **APIs & Services** → **Library**.
   2. Search for **Google Play Android Developer API**.
   3. Click **Enable**.

3. **Create a Service Account**
   1. Navigate to **IAM & Admin** → **Service Accounts**.
   2. Click **Create Service Account**.
   3. Give it a descriptive name (e.g. `eas-submit`).
   4. Skip the optional permissions step (permissions are granted in Play
      Console).
   5. Click **Done**.

4. **Generate a JSON Key**
   1. Click on the newly created service account.
   2. Go to the **Keys** tab.
   3. Click **Add Key** → **Create new key** → **JSON**.
   4. Download the JSON file.
   5. Rename it to `google-services.json` and place it in `apps/native/`.

5. **Grant Play Console Access**
   1. Go to [Google Play Console](https://play.google.com/console).
   2. Navigate to **Settings** → **API access**.
   3. Link your Google Cloud project if not already linked.
   4. Find your service account and click **Manage Play Console permissions**.
   5. Grant the following permissions:
      - **Release management** → Manage production and testing track releases
      - **App information** → View app information (read-only)
   6. Click **Invite user** and confirm.

6. **Important: Do NOT commit the JSON key**
   - Add `google-services.json` to `.gitignore`.
   - For CI, upload the key as an EAS secret:
     ```bash
     eas secret:create --name GOOGLE_SERVICE_ACCOUNT_KEY --type file --value ./google-services.json
     ```

---

## Android Release Settings

The `eas.json` Android submit config includes:

```json
"android": {
  "serviceAccountKeyPath": "./google-services.json",
  "track": "internal",
  "releaseStatus": "draft"
}
```

| Setting                 | Value                    | Description                                                                                                                                            |
| ----------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `serviceAccountKeyPath` | `./google-services.json` | Path to the Google Play service account JSON key file.                                                                                                 |
| `track`                 | `"internal"`             | Publishes to the **internal testing** track. Only internal testers see the build. Change to `"alpha"`, `"beta"`, or `"production"` for wider releases. |
| `releaseStatus`         | `"draft"`                | Creates the release as a **draft**. You must manually promote it in the Play Console. Change to `"completed"` to auto-publish to the selected track.   |

### Changing Tracks for Wider Releases

| Track        | Audience                                      |
| ------------ | --------------------------------------------- |
| `internal`   | Up to 100 internal testers (fastest approval) |
| `alpha`      | Closed testing group                          |
| `beta`       | Open testing (anyone with the link)           |
| `production` | All Play Store users                          |

To promote a build, either change the `track` value in `eas.json` or manually
promote the release in the Google Play Console.

---

## Testing Your Configuration

```bash
# Dry-run iOS submission (validates credentials without uploading)
cd apps/native
eas submit --platform ios --profile production --latest

# Dry-run Android submission
eas submit --platform android --profile production --latest
```

If you encounter authentication errors, double-check:

- Apple: Correct Apple ID, ASC App ID, and Team ID
- Android: Service account has API access enabled in Play Console
- Both: `EXPO_TOKEN` is set for CI environments
