# Code Signing for Production

This document covers iOS and Android code signing setup for production builds
distributed through the App Store and Google Play.

---

## Table of Contents

- [Overview](#overview)
- [iOS: EAS Managed Signing](#ios-eas-managed-signing)
- [Android: Upload Keystore](#android-upload-keystore)
- [credentials.json Approach](#credentialsjson-approach)
- [Security Best Practices](#security-best-practices)

---

## Overview

Code signing is required by both Apple and Google to verify the identity of the
app publisher and ensure the binary hasn't been tampered with.

EAS Build handles most of the complexity for you:

- **iOS**: Fully managed provisioning profiles and certificates.
- **Android**: You provide an upload keystore; Google manages the app signing
  key.

---

## iOS: EAS Managed Signing

EAS Build provides **fully managed iOS code signing** by default. This means:

1. EAS generates and manages your **Distribution Certificate** and
   **Provisioning Profile** automatically.
2. Certificates are stored securely on Expo's servers.
3. You don't need to manually create or download certificates from the Apple
   Developer Portal.

### How It Works

1. On your first `eas build --platform ios --profile production`, EAS will:
   - Create a Distribution Certificate (if one doesn't exist).
   - Create a Provisioning Profile for your bundle identifier.
   - Store both securely in your Expo account.
2. Subsequent builds reuse the same credentials automatically.
3. If a certificate expires, EAS creates a new one on the next build.

### Manual Override

If you need to use your own certificates (e.g., enterprise distribution):

1. Download your `.p12` certificate and `.mobileprovision` file from the Apple
   Developer Portal.
2. Configure them in `credentials.json` (see below).
3. Run `eas credentials` to upload them to EAS.

### Ad Hoc Distribution (Preview Builds)

For `preview` profile builds distributed via ad hoc:

- EAS manages an Ad Hoc Provisioning Profile.
- Test devices must be registered. Use `eas device:create` to add UDIDs.
- The provisioning profile is regenerated when devices are added.

---

## Android: Upload Keystore

Google Play uses **App Signing by Google Play** (also called Play App Signing).
You provide an **upload keystore** to sign the binary you upload, and Google
re-signs it with the actual app signing key for distribution.

### Step 1: Generate an Upload Keystore

```bash
# Generate a new keystore (you'll be prompted for passwords)
keytool -genkeypair \
  -v \
  -storetype JKS \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -alias upload \
  -keystore upload-keystore.jks \
  -dname "CN=Your Name, OU=Your Org, O=Your Company, L=City, ST=State, C=US"
```

### Step 2: Configure EAS to Use the Keystore

Option A — Let EAS manage it (recommended):

```bash
# EAS will prompt you to provide the keystore on first build
eas build --platform android --profile production
```

Option B — Upload manually:

```bash
# Upload your keystore to EAS
eas credentials --platform android
# Select "Upload a keystore" and follow the prompts
```

### Step 3: Enroll in Play App Signing

1. Go to [Google Play Console](https://play.google.com/console).
2. Select your app → **Setup** → **App signing**.
3. Choose **Use Google-generated key** (recommended for new apps).
4. Upload your **upload key certificate** (exported from the keystore):
   ```bash
   keytool -export -rfc \
     -alias upload \
     -keystore upload-keystore.jks \
     -file upload-cert.pem
   ```
5. Google will use this to verify uploads signed with your upload keystore.

---

## credentials.json Approach

For advanced use cases, you can store signing credentials in a
`credentials.json` file that EAS reads during builds.

### Example credentials.json

```json
{
  "android": {
    "keystore": {
      "keystorePath": "./credentials/upload-keystore.jks",
      "keystorePassword": "YOUR_STORE_PASSWORD",
      "keyAlias": "upload",
      "keyPassword": "YOUR_KEY_PASSWORD"
    }
  },
  "ios": {
    "provisioningProfilePath": "./credentials/profile.mobileprovision",
    "distributionCertificate": {
      "path": "./credentials/dist-cert.p12",
      "password": "YOUR_CERT_PASSWORD"
    }
  }
}
```

### Using credentials.json with EAS

1. Create the file at `apps/native/credentials.json`.
2. EAS Build automatically detects and uses it.
3. For CI, use EAS Secrets instead of committing the file:
   ```bash
   eas secret:create --name CREDENTIALS_JSON --type file --value ./credentials.json
   ```

---

## Security Best Practices

> **⚠️ WARNING: Never commit keystores, certificates, or credentials.json to
> version control.**

### What to Keep Secret

| File / Value           | Where to Store                      |
| ---------------------- | ----------------------------------- |
| `upload-keystore.jks`  | Local machine + EAS Secrets         |
| Keystore passwords     | EAS Secrets or CI secret store      |
| `credentials.json`     | Local machine only (or EAS Secrets) |
| iOS `.p12` certificate | EAS managed (or EAS Secrets)        |
| iOS `.mobileprovision` | EAS managed (or EAS Secrets)        |

### .gitignore Entries

Ensure these are in your `.gitignore`:

```gitignore
# Code signing — never commit these
*.jks
*.keystore
*.p12
*.mobileprovision
credentials.json
google-services.json
```

### Recovery Plan

- **iOS**: EAS can regenerate certificates and profiles automatically. If you
  lose access, revoke old certs in the Apple Developer Portal and let EAS create
  new ones.
- **Android**: If you lose the upload keystore, you can request a **key
  upgrade** through Google Play Console support. This process takes several
  days. Keep backups in a secure location (e.g., a password manager or encrypted
  cloud storage).
