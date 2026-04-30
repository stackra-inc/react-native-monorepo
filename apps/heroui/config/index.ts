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
  ApiSettings,
  AppConfigShape,
  AppEnvironment,
  AppSettings,
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
  AuthStorageKeys,
  CacheStorageKeys,
  PreferenceStorageKeys,
  StorageConfigShape,
  StorageKeys,
} from "./storage.config";

// ============================================================================
// Sentry Configuration
// ============================================================================
export { SentryConfig, initSentry } from "./sentry.config";
export type { SentryConfigShape } from "./sentry.config";

// ============================================================================
// Redis Configuration
// ============================================================================
export { default as redisConfig } from "./redis.config";
