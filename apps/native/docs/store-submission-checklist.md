# Store Submission Checklist

Use this checklist to track all assets and metadata required for the first App
Store and Google Play submission. Check off each item as it's completed.

---

## Table of Contents

- [Apple App Store Connect](#apple-app-store-connect)
- [Google Play Console](#google-play-console)
- [Privacy Policy](#privacy-policy)
- [Common Rejection Reasons](#common-rejection-reasons)

---

## Apple App Store Connect

### App Information

- [ ] **App Name** — The name displayed on the App Store (max 30 characters)
- [ ] **Subtitle** — Short description below the app name (max 30 characters)
- [ ] **Bundle ID** — `com.herouinative.app` (configured in app.json)
- [ ] **SKU** — A unique identifier for your app (not visible to users)
- [ ] **Primary Language** — The default language for your app listing
- [ ] **Category** — Primary and optional secondary category
- [ ] **Content Rights** — Confirm you own or have rights to all content

### Description & Keywords

- [ ] **Description** — Full app description (max 4000 characters)
- [ ] **Keywords** — Comma-separated search keywords (max 100 characters)
- [ ] **What's New** — Release notes for this version
- [ ] **Support URL** — Link to your support page or contact form
- [ ] **Marketing URL** — Optional link to your marketing website

### Screenshots

- [ ] **6.7" iPhone** (1290 × 2796) — iPhone 15 Pro Max, iPhone 16 Pro Max
      (required)
- [ ] **6.5" iPhone** (1284 × 2778) — iPhone 14 Plus, iPhone 13 Pro Max
      (required)
- [ ] **5.5" iPhone** (1242 × 2208) — iPhone 8 Plus (required if supporting
      older devices)
- [ ] **iPad Pro 12.9"** (2048 × 2732) — Required if `supportsTablet: true`
- [ ] **iPad Pro 13"** (2064 × 2752) — Required for latest iPad Pro

> Minimum 2 screenshots per device size, maximum 10. Include key features and
> workflows.

### App Icon

- [ ] **App Icon** (1024 × 1024 px) — No transparency, no rounded corners (Apple
      applies the mask automatically)

### Age Rating

- [ ] **Age Rating Questionnaire** — Complete the questionnaire in App Store
      Connect (covers violence, language, mature content, etc.)

### Review Information

- [ ] **Review Contact** — Name, phone number, and email for the App Review team
- [ ] **Demo Account** — If the app requires login, provide test credentials
- [ ] **Review Notes** — Any special instructions for the reviewer

### Build

- [ ] **Production build uploaded** via EAS Submit or Transporter
- [ ] **Build selected** in the App Store Connect version page
- [ ] **Export compliance** — `ITSAppUsesNonExemptEncryption: false` is set in
      app.json (already configured)

---

## Google Play Console

### Store Listing

- [ ] **Title** — App name on Google Play (max 30 characters)
- [ ] **Short Description** — Brief summary (max 80 characters)
- [ ] **Full Description** — Detailed description (max 4000 characters)
- [ ] **Default Language** — Primary language for the listing

### Graphics

- [ ] **App Icon** (512 × 512 px) — 32-bit PNG with alpha channel
- [ ] **Feature Graphic** (1024 × 500 px) — Displayed at the top of the store
      listing. Required.
- [ ] **Phone Screenshots** — Minimum 2, maximum 8 (16:9 or 9:16 aspect ratio)
- [ ] **7" Tablet Screenshots** — Required if targeting tablets
- [ ] **10" Tablet Screenshots** — Required if targeting tablets

### Content Rating

- [ ] **Content Rating Questionnaire** — Complete the IARC questionnaire in the
      Play Console (covers violence, sexuality, language, substances, etc.)

### Target Audience

- [ ] **Target Age Group** — Select the appropriate age range
- [ ] **Target audience declaration** — Required for apps targeting children

### App Category

- [ ] **Application type** — App or Game
- [ ] **Category** — Select the most relevant category

### Contact Details

- [ ] **Developer email** — Public contact email
- [ ] **Developer website** — Optional but recommended
- [ ] **Developer phone** — Optional

### Build

- [ ] **Production AAB uploaded** via EAS Submit or Play Console
- [ ] **Release created** on the appropriate track (internal → beta →
      production)
- [ ] **Play App Signing** enrolled (see code-signing.md)

---

## Privacy Policy

> **⚠️ Both Apple and Google require a publicly accessible privacy policy URL
> before your app can be approved for distribution.**

- [ ] **Privacy policy URL** — Must be publicly accessible (not behind auth)
- [ ] **Privacy policy covers Sentry** — Mention that crash reports and device
      information are collected for error tracking and debugging purposes
- [ ] **Privacy policy covers analytics** — If `EXPO_PUBLIC_ANALYTICS_ENABLED`
      is `true`, disclose what analytics data is collected
- [ ] **Privacy policy covers device permissions** — Disclose camera, photo
      library, and location usage as declared in app.json `infoPlist`
- [ ] **Apple Privacy Nutrition Labels** — Complete the App Privacy section in
      App Store Connect (data types collected, linked to identity, tracking,
      etc.)
- [ ] **Google Data Safety** — Complete the Data Safety form in Play Console

> **Note:** Do not add a `privacyUrl` field to `app.json` until a real URL is
> available. Submitting a broken or placeholder link will cause rejection.

---

## Common Rejection Reasons

### Apple

| Reason                          | How to Avoid                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| **Crashes or bugs**             | Test thoroughly on real devices. Check Sentry for crash reports.                        |
| **Broken links**                | Verify all URLs (support, marketing, privacy policy) are live and accessible.           |
| **Incomplete metadata**         | Fill in all required fields above. Don't leave placeholders.                            |
| **Login required without demo** | Provide demo credentials in Review Notes if the app requires authentication.            |
| **Missing privacy policy**      | Ensure the privacy policy URL is live and covers all data collection.                   |
| **Guideline 4.3 — Spam**        | Ensure the app provides unique value and isn't a duplicate of another app.              |
| **Missing purpose strings**     | All permission usage descriptions must be clear and specific (already set in app.json). |
| **iPad support issues**         | If `supportsTablet: true`, test the UI on iPad and provide iPad screenshots.            |

### Google Play

| Reason                       | How to Avoid                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------ |
| **Policy violation**         | Review Google Play Developer Policies before submission.                       |
| **Missing content rating**   | Complete the IARC questionnaire before submitting.                             |
| **Missing privacy policy**   | Privacy policy URL must be set in the store listing.                           |
| **Target audience issues**   | If the app could appeal to children, complete the target audience declaration. |
| **Broken functionality**     | Test on multiple Android versions and screen sizes.                            |
| **Missing Data Safety form** | Complete the Data Safety section in Play Console.                              |
| **Deceptive behavior**       | App behavior must match the store listing description.                         |
