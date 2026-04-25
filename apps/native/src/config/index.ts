/**
 * Configuration Barrel Export
 *
 * Re-exports all typed configuration objects from a single entry point.
 *
 * - {@link AppConfig} — App identity, environment, and feature flags
 * - {@link ApiConfig} — API endpoints, headers, and retry policy
 * - {@link StorageConfig} — AsyncStorage key registry
 *
 * @module config
 */

// ============================================================================
// App Configuration
// ============================================================================
export { AppConfig } from "./app.config";
export type {
  AppConfigShape,
  AppEnvironment,
  AppSettings,
  ApiSettings,
  LogLevel,
  ObservabilitySettings,
} from "./app.config";

// ============================================================================
// API Configuration
// ============================================================================
export { ApiConfig } from "./api.config";
export type {
  ApiConfigShape,
  ApiEndpoints,
  AuthEndpoints,
  RetryPolicy,
  UserEndpoints,
} from "./api.config";

// ============================================================================
// Storage Configuration
// ============================================================================
export { StorageConfig } from "./storage.config";
export type {
  StorageConfigShape,
  StorageKeys,
  AuthStorageKeys,
  CacheStorageKeys,
  PreferenceStorageKeys,
} from "./storage.config";

// ============================================================================
// Sentry Configuration
// ============================================================================
export { initSentry, SentryConfig } from "./sentry.config";
export type { SentryConfigShape } from "./sentry.config";
