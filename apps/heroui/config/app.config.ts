/**
 * App Configuration
 *
 * Typed, centralized configuration for the native application.
 * All environment-specific values are read from `EXPO_PUBLIC_*`
 * environment variables and exposed as a single frozen object.
 *
 * ## Environment Variables
 *
 * | Variable                        | Description                    | Default          |
 * |---------------------------------|--------------------------------|------------------|
 * | `EXPO_PUBLIC_APP_NAME`          | Display name of the app        | `"HeroUI Native"`|
 * | `EXPO_PUBLIC_APP_ENV`           | Current environment            | `"development"`  |
 * | `EXPO_PUBLIC_API_URL`           | Base URL for the API           | `""`             |
 * | `EXPO_PUBLIC_API_TIMEOUT`       | API request timeout in ms      | `30000`          |
 * | `EXPO_PUBLIC_SENTRY_DSN`        | Sentry DSN for error tracking  | `""`             |
 * | `EXPO_PUBLIC_ANALYTICS_ENABLED` | Enable analytics collection    | `"false"`        |
 * | `EXPO_PUBLIC_LOG_LEVEL`         | Minimum log level              | `"debug"`        |
 *
 * ## Usage
 *
 * ```typescript
 * import { AppConfig } from "@/config/app.config";
 *
 * console.log(AppConfig.app.name);       // "HeroUI Native"
 * console.log(AppConfig.api.url);        // "https://api.example.com"
 * console.log(AppConfig.app.isProduction); // false
 * ```
 *
 * @module config/app
 */

// ── Types ───────────────────────────────────────────────────────────────────

/**
 * Application environment identifier.
 *
 * Determines which configuration profile is active and controls
 * behavior like logging verbosity and analytics collection.
 */
export type AppEnvironment = "development" | "preview" | "production";

/**
 * Log level for the application logger.
 *
 * Controls the minimum severity of messages that are emitted.
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

/**
 * Core application identity and environment settings.
 */
export interface AppSettings {
  /** Display name of the application. */
  readonly name: string;

  /** Current environment (development, preview, production). */
  readonly env: AppEnvironment;

  /** Semantic version string from app.json. */
  readonly version: string;

  /** Whether the app is running in production mode. */
  readonly isProduction: boolean;

  /** Whether the app is running in development mode. */
  readonly isDevelopment: boolean;

  /** Whether the app is running in preview mode. */
  readonly isPreview: boolean;
}

/**
 * API connection settings.
 */
export interface ApiSettings {
  /** Base URL for the backend API (no trailing slash). */
  readonly url: string;

  /** Request timeout in milliseconds. */
  readonly timeout: number;
}

/**
 * Observability and monitoring settings.
 */
export interface ObservabilitySettings {
  /** Sentry DSN for error tracking. Empty string disables Sentry. */
  readonly sentryDsn: string;

  /** Whether analytics/telemetry collection is enabled. */
  readonly analyticsEnabled: boolean;

  /** Minimum log level for the application logger. */
  readonly logLevel: LogLevel;
}

/**
 * Root configuration object combining all settings groups.
 */
export interface AppConfigShape {
  /** Core application identity and environment. */
  readonly app: AppSettings;

  /** API connection settings. */
  readonly api: ApiSettings;

  /** Observability, logging, and monitoring. */
  readonly observability: ObservabilitySettings;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Read an environment variable with a fallback default.
 *
 * Uses the `process.env.EXPO_PUBLIC_*` pattern which Expo inlines
 * at build time via babel-plugin-transform-inline-environment-variables.
 *
 * @param key - The environment variable name (without `EXPO_PUBLIC_` prefix)
 * @param fallback - Default value if the variable is not set
 * @returns The environment variable value or the fallback
 */
function env(key: string, fallback: string = ""): string {
  // Expo inlines EXPO_PUBLIC_* at build time
  const fullKey = `EXPO_PUBLIC_${key}`;
  const value = (process.env as Record<string, string | undefined>)[fullKey];

  return value ?? fallback;
}

/**
 * Parse a string environment variable as a boolean.
 *
 * @param value - The string value to parse
 * @returns `true` if the value is "true", "1", or "yes" (case-insensitive)
 */
function parseBool(value: string): boolean {
  return ["true", "1", "yes"].includes(value.trim().toLowerCase());
}

/**
 * Parse a string environment variable as an integer.
 *
 * @param value - The string value to parse
 * @param fallback - Default value if parsing fails
 * @returns The parsed integer or the fallback
 */
function parseInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? fallback : parsed;
}

// ── Config Construction ─────────────────────────────────────────────────────

const appEnv = env("APP_ENV", "development") as AppEnvironment;

/**
 * Frozen, typed application configuration.
 *
 * All values are resolved once at module load time from
 * `EXPO_PUBLIC_*` environment variables. The object is deeply
 * frozen to prevent accidental mutation.
 *
 * @example
 * ```typescript
 * import { AppConfig } from "@/config/app.config";
 *
 * if (AppConfig.app.isProduction) {
 *   // production-only logic
 * }
 *
 * fetch(`${AppConfig.api.url}/users`);
 * ```
 */
export const AppConfig: AppConfigShape = Object.freeze({
  app: Object.freeze({
    name: env("APP_NAME", "HeroUI Native"),
    env: appEnv,
    version: "1.0.0",
    isProduction: appEnv === "production",
    isDevelopment: appEnv === "development",
    isPreview: appEnv === "preview",
  }),

  api: Object.freeze({
    url: env("API_URL", ""),
    timeout: parseInt(env("API_TIMEOUT", "30000"), 30000),
  }),

  observability: Object.freeze({
    sentryDsn: env("SENTRY_DSN", ""),
    analyticsEnabled: parseBool(env("ANALYTICS_ENABLED", "false")),
    logLevel: env("LOG_LEVEL", "debug") as LogLevel,
  }),
});
