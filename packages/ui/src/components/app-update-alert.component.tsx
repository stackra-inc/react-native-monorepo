/**
 * @fileoverview AppUpdateAlert — React Native component for displaying
 * app update notifications.
 *
 * Shows an in-app alert for non-mandatory updates (dismissible banner)
 * and a blocking modal screen for mandatory updates. Integrates with
 * AsyncStorage to remember dismissed versions so the same non-mandatory
 * update notification isn't shown repeatedly.
 *
 * This is the mobile counterpart to `AppUpdateBanner` in `@stackra/ts-pwa`.
 * While the web version handles both SW-based and server-driven updates,
 * this component focuses on server-driven notifications received via the
 * `app.updates` broadcasting channel through `MobileSettingsSyncService`.
 *
 * @module components/app-update-alert
 */

import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Linking, StyleSheet } from "react-native";
import type { ViewStyle, TextStyle } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Constants ───────────────────────────────────────────────────────────────

/**
 * AsyncStorage key used to persist the last dismissed update version.
 * When a user dismisses a non-mandatory update, the version string is
 * stored here to suppress re-display on subsequent renders.
 */
const DISMISSED_KEY = "stackra:dismissed-update-version";

// ── Props ───────────────────────────────────────────────────────────────────

/**
 * Props for the {@link AppUpdateAlert} component.
 *
 * @example
 * ```tsx
 * <AppUpdateAlert
 *   version="2.1.0"
 *   mandatory={false}
 *   storeUrl="https://apps.apple.com/app/id123456"
 *   onDismiss={() => console.log('Update dismissed')}
 * />
 * ```
 */
interface AppUpdateAlertProps {
  /**
   * The new version number to display in the alert.
   * Should follow semantic versioning (e.g. `"2.1.0"`).
   */
  version: string;

  /**
   * Whether the update is mandatory.
   * - `true`: renders a blocking modal that cannot be dismissed
   * - `false`: renders a dismissible banner at the top of the screen
   */
  mandatory: boolean;

  /**
   * App store URL for the current platform.
   * Opened via `Linking.openURL()` when the user taps "Update" or "Update Now".
   * Should be the App Store URL on iOS or Google Play URL on Android.
   */
  storeUrl: string;

  /**
   * Callback invoked when the user dismisses a non-mandatory update.
   * Not called for mandatory updates (they cannot be dismissed).
   */
  onDismiss?: () => void;
}

// ── Component ───────────────────────────────────────────────────────────────

/**
 * AppUpdateAlert — displays app update notifications in React Native.
 *
 * Renders two distinct UI modes based on the `mandatory` prop:
 *
 * **Mandatory updates** — A full-screen blocking modal with a semi-transparent
 * overlay. The user can only tap "Update Now" to open the app store. There is
 * no dismiss option, preventing continued use of an outdated version.
 *
 * **Non-mandatory updates** — A compact banner with the version number, an
 * "Update" button, and a dismiss ("×") button. Dismissed versions are persisted
 * to AsyncStorage so the same version isn't shown again on subsequent renders.
 * A different version will still trigger the banner (Property 16 in the design).
 *
 * @param props - Component props including version, mandatory flag, store URL, and dismiss callback
 * @returns The update alert UI, or `null` if the update was previously dismissed
 *
 * @example
 * ```tsx
 * // Non-mandatory update banner
 * <AppUpdateAlert
 *   version="2.1.0"
 *   mandatory={false}
 *   storeUrl="https://apps.apple.com/app/id123456"
 *   onDismiss={() => analytics.track('update_dismissed')}
 * />
 *
 * // Mandatory blocking modal
 * <AppUpdateAlert
 *   version="3.0.0"
 *   mandatory={true}
 *   storeUrl="https://play.google.com/store/apps/details?id=com.example"
 * />
 * ```
 */
export function AppUpdateAlert({ version, mandatory, storeUrl, onDismiss }: AppUpdateAlertProps) {
  /**
   * Whether the user has previously dismissed this specific version.
   * Loaded from AsyncStorage on mount for non-mandatory updates.
   */
  const [dismissed, setDismissed] = useState(false);

  /**
   * Controls banner visibility for non-mandatory updates.
   * Set to `false` when the user taps the dismiss button.
   */
  const [visible, setVisible] = useState(true);

  // ── Check if this version was previously dismissed ──────────────────
  useEffect(() => {
    // Mandatory updates cannot be dismissed — skip the check
    if (!mandatory) {
      AsyncStorage.getItem(DISMISSED_KEY)
        .then((storedVersion) => {
          // Only suppress if the stored version matches exactly
          if (storedVersion === version) {
            setDismissed(true);
          }
        })
        .catch(() => {
          // AsyncStorage read failure — show the alert anyway
        });
    }
  }, [version, mandatory]);

  // ── Dismiss handler (non-mandatory only) ────────────────────────────

  /**
   * Handle dismissal of a non-mandatory update alert.
   *
   * Persists the dismissed version to AsyncStorage so it won't be
   * shown again, hides the banner, and invokes the `onDismiss` callback.
   */
  const handleDismiss = useCallback(async () => {
    // Persist the dismissed version to AsyncStorage
    try {
      await AsyncStorage.setItem(DISMISSED_KEY, version);
    } catch {
      // Best-effort persistence — don't block the dismiss action
    }

    setDismissed(true);
    setVisible(false);
    onDismiss?.();
  }, [version, onDismiss]);

  // ── Update handler ──────────────────────────────────────────────────

  /**
   * Open the app store URL when the user taps the update button.
   *
   * Uses React Native's `Linking.openURL()` which handles both
   * App Store (iOS) and Google Play (Android) URLs.
   */
  const handleUpdate = useCallback(() => {
    Linking.openURL(storeUrl).catch(() => {
      // URL open failure — the store app may not be installed
      // or the URL may be malformed. Silently fail.
    });
  }, [storeUrl]);

  // ── Render: previously dismissed non-mandatory update ───────────────
  if (dismissed && !mandatory) return null;

  // ── Render: mandatory blocking modal ────────────────────────────────
  if (mandatory) {
    return (
      <Modal visible={true} transparent animationType="fade" testID="app-update-modal">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* Modal title */}
            <Text style={styles.title}>Update Required</Text>

            {/* Version information */}
            <Text style={styles.body}>Version {version} is required to continue.</Text>

            {/* Update button — only action available */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleUpdate}
              testID="app-update-button"
              accessibilityRole="button"
              accessibilityLabel={`Update to version ${version}`}
            >
              <Text style={styles.buttonText}>Update Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ── Render: non-mandatory dismissible banner ────────────────────────
  if (!visible) return null;

  return (
    <View style={styles.banner} testID="app-update-banner" accessibilityRole="alert">
      {/* Version availability message */}
      <Text style={styles.bannerText}>Version {version} is available</Text>

      {/* Update button — opens app store */}
      <TouchableOpacity
        style={styles.updateBtn}
        onPress={handleUpdate}
        testID="app-update-banner-button"
        accessibilityRole="button"
        accessibilityLabel={`Update to version ${version}`}
      >
        <Text style={styles.updateBtnText}>Update</Text>
      </TouchableOpacity>

      {/* Dismiss button — hides banner and persists dismissal */}
      <TouchableOpacity
        onPress={handleDismiss}
        testID="app-update-dismiss-button"
        accessibilityRole="button"
        accessibilityLabel="Dismiss update notification"
      >
        <Text style={styles.dismissText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

/**
 * StyleSheet for the AppUpdateAlert component.
 *
 * Uses a dark color scheme for the banner to ensure visibility
 * regardless of the current theme. The modal overlay uses a
 * semi-transparent black background to block interaction with
 * the underlying content.
 */
const styles = StyleSheet.create({
  // ── Mandatory modal styles ──────────────────────────────────────────

  /** Semi-transparent overlay covering the entire screen */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,

  /** Centered modal card with rounded corners */
  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "85%",
    alignItems: "center",
  } as ViewStyle,

  /** Modal title text */
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  } as TextStyle,

  /** Modal body text with version information */
  body: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  } as TextStyle,

  /** Primary action button in the modal */
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  } as ViewStyle,

  /** Primary action button text */
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  } as TextStyle,

  // ── Non-mandatory banner styles ─────────────────────────────────────

  /** Horizontal banner container with dark background */
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 12,
    gap: 8,
  } as ViewStyle,

  /** Banner message text — fills available space */
  bannerText: {
    flex: 1,
    color: "#f1f5f9",
    fontSize: 14,
  } as TextStyle,

  /** Compact update button in the banner */
  updateBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  } as ViewStyle,

  /** Update button text */
  updateBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  } as TextStyle,

  /** Dismiss button text (× symbol) */
  dismissText: {
    color: "#94a3b8",
    fontSize: 20,
    paddingHorizontal: 4,
  } as TextStyle,
});
