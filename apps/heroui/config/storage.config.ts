/**
 * Storage Configuration
 *
 * Centralized AsyncStorage key registry and storage-related settings.
 * All AsyncStorage keys used across the app are defined here to prevent
 * key collisions and make it easy to audit persisted data.
 *
 * ## Usage
 *
 * ```typescript
 * import { StorageConfig } from "@/config/storage.config";
 * import AsyncStorage from "@react-native-async-storage/async-storage";
 *
 * await AsyncStorage.setItem(StorageConfig.keys.authToken, token);
 * await AsyncStorage.getItem(StorageConfig.keys.theme);
 * ```
 *
 * @module config/storage
 */

// ── Types ───────────────────────────────────────────────────────────────────

/**
 * Authentication-related storage keys.
 */
export interface AuthStorageKeys {
  /** JWT access token. */
  readonly accessToken: string;

  /** JWT refresh token. */
  readonly refreshToken: string;

  /** Serialized user profile object. */
  readonly user: string;
}

/**
 * Preference-related storage keys.
 */
export interface PreferenceStorageKeys {
  /** Active theme variant name (e.g. "lavender-dark"). */
  readonly theme: string;

  /** User's preferred locale (e.g. "en-US"). */
  readonly locale: string;

  /** Whether the user has completed onboarding. */
  readonly onboardingComplete: string;

  /** Whether the user has accepted analytics consent. */
  readonly analyticsConsent: string;
}

/**
 * Cache-related storage keys.
 */
export interface CacheStorageKeys {
  /** Timestamp of the last successful API sync. */
  readonly lastSync: string;
}

/**
 * All AsyncStorage keys grouped by domain.
 */
export interface StorageKeys {
  /** Authentication tokens and user data. */
  readonly auth: AuthStorageKeys;

  /** User preferences and settings. */
  readonly preferences: PreferenceStorageKeys;

  /** Cache metadata. */
  readonly cache: CacheStorageKeys;
}

/**
 * Root storage configuration shape.
 */
export interface StorageConfigShape {
  /** Key prefix applied to all storage keys for namespacing. */
  readonly prefix: string;

  /** All registered storage keys. */
  readonly keys: StorageKeys;
}

// ── Config Construction ─────────────────────────────────────────────────────

/** Namespace prefix for all AsyncStorage keys. */
const PREFIX = "@app";

/**
 * Frozen, typed storage configuration.
 *
 * Every AsyncStorage key in the app is registered here. The prefix
 * ensures no collisions with third-party libraries that also use
 * AsyncStorage.
 *
 * @example
 * ```typescript
 * import { StorageConfig } from "@/config/storage.config";
 *
 * // Read the persisted theme
 * const theme = await AsyncStorage.getItem(StorageConfig.keys.preferences.theme);
 *
 * // Clear all auth data on logout
 * await AsyncStorage.multiRemove([
 *   StorageConfig.keys.auth.accessToken,
 *   StorageConfig.keys.auth.refreshToken,
 *   StorageConfig.keys.auth.user,
 * ]);
 * ```
 */
export const StorageConfig: StorageConfigShape = Object.freeze({
  prefix: PREFIX,

  keys: Object.freeze({
    auth: Object.freeze({
      accessToken: `${PREFIX}:auth:access_token`,
      refreshToken: `${PREFIX}:auth:refresh_token`,
      user: `${PREFIX}:auth:user`,
    }),

    preferences: Object.freeze({
      theme: `${PREFIX}:preferences:theme`,
      locale: `${PREFIX}:preferences:locale`,
      onboardingComplete: `${PREFIX}:preferences:onboarding_complete`,
      analyticsConsent: `${PREFIX}:preferences:analytics_consent`,
    }),

    cache: Object.freeze({
      lastSync: `${PREFIX}:cache:last_sync`,
    }),
  }),
});
