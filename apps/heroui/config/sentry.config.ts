/**
 * Sentry Configuration
 *
 * Initializes the Sentry SDK for error tracking and crash reporting.
 * Reads the DSN and environment from {@link AppConfig} so all
 * configuration stays centralized.
 *
 * ## Prerequisites
 *
 * Before using this module, install the Sentry SDK:
 *
 * ```bash
 * npx expo install @sentry/react-native
 * ```
 *
 * Then add the Sentry plugin to `app.json` plugins array:
 *
 * ```json
 * [
 *   "@sentry/react-native/expo",
 *   {
 *     "organization": "YOUR_SENTRY_ORG",
 *     "project": "YOUR_SENTRY_PROJECT",
 *     "url": "https://sentry.io/"
 *   }
 * ]
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { initSentry } from "@/config/sentry.config";
 *
 * // Call once at app startup (before component rendering)
 * initSentry();
 * ```
 *
 * @module config/sentry
 */

// TODO: Uncomment the import below after installing @sentry/react-native
// import * as Sentry from "@sentry/react-native";

import { AppConfig } from "./app.config";

// ── Types ───────────────────────────────────────────────────────────────────

/**
 * Sentry configuration shape.
 *
 * Mirrors the subset of Sentry SDK options used by this project.
 */
export interface SentryConfigShape {
  /** Sentry Data Source Name — identifies the project in Sentry. */
  readonly dsn: string;

  /** Current app environment tag (development, preview, production). */
  readonly environment: string;

  /** Enable verbose SDK logging (true in development). */
  readonly debug: boolean;

  /**
   * Sample rate for performance transactions (0.0 to 1.0).
   * 1.0 = capture 100% of transactions.
   * Reduce in production to control costs.
   */
  readonly tracesSampleRate: number;

  /** Whether Sentry is enabled (DSN is non-empty). */
  readonly enabled: boolean;
}

// ── Config ──────────────────────────────────────────────────────────────────

/**
 * Sentry configuration derived from {@link AppConfig}.
 *
 * - `dsn` comes from `EXPO_PUBLIC_SENTRY_DSN`
 * - `environment` comes from `EXPO_PUBLIC_APP_ENV`
 * - `debug` is `true` only in development
 * - `tracesSampleRate` is 1.0 in development/preview, 0.2 in production
 * - `enabled` is `true` when a DSN is provided
 */
export const SentryConfig: SentryConfigShape = Object.freeze({
  dsn: AppConfig.observability.sentryDsn,
  environment: AppConfig.app.env,
  debug: AppConfig.app.isDevelopment,
  tracesSampleRate: AppConfig.app.isProduction ? 0.2 : 1.0,
  enabled: AppConfig.observability.sentryDsn.length > 0,
});

// ── Initialization ──────────────────────────────────────────────────────────

/**
 * Initialize the Sentry SDK.
 *
 * Call this function once at app startup, before any React component
 * renders. It configures Sentry with the DSN, environment tags, and
 * sampling rates from {@link SentryConfig}.
 *
 * If no DSN is configured (empty string), initialization is skipped
 * and a console message is logged.
 *
 * @example
 * ```typescript
 * // In _layout.tsx, before the component definition:
 * import { initSentry } from "@/config/sentry.config";
 * initSentry();
 * ```
 */
export function initSentry(): void {
  if (!SentryConfig.enabled) {
    console.log("[Sentry] No DSN configured — skipping initialization.");
    return;
  }

  // TODO: Uncomment after installing @sentry/react-native
  // Sentry.init({
  //   dsn: SentryConfig.dsn,
  //   environment: SentryConfig.environment,
  //   debug: SentryConfig.debug,
  //   tracesSampleRate: SentryConfig.tracesSampleRate,
  //
  //   // Tag every event with the app environment for filtering in Sentry UI
  //   initialScope: {
  //     tags: {
  //       "app.env": SentryConfig.environment,
  //     },
  //   },
  // });

  console.log(
    `[Sentry] Initialized for environment: ${SentryConfig.environment}`,
    `(debug: ${SentryConfig.debug}, tracesSampleRate: ${SentryConfig.tracesSampleRate})`,
  );
}
