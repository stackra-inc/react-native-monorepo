/**
 * API Configuration
 *
 * Typed configuration for API endpoints, headers, and retry behavior.
 * Builds on top of {@link AppConfig} for base URL and timeout values,
 * then adds endpoint paths, default headers, and retry policies.
 *
 * ## Usage
 *
 * ```typescript
 * import { ApiConfig } from "@/config/api.config";
 *
 * fetch(`${ApiConfig.baseUrl}${ApiConfig.endpoints.auth.login}`, {
 *   headers: ApiConfig.defaultHeaders,
 * });
 * ```
 *
 * @module config/api
 */

import { AppConfig } from "./app.config";

// ── Types ───────────────────────────────────────────────────────────────────

/**
 * Authentication-related API endpoints.
 */
export interface AuthEndpoints {
  /** POST — authenticate with credentials. */
  readonly login: string;

  /** POST — create a new account. */
  readonly register: string;

  /** POST — refresh an expired access token. */
  readonly refresh: string;

  /** POST — invalidate the current session. */
  readonly logout: string;

  /** GET — fetch the authenticated user's profile. */
  readonly me: string;
}

/**
 * User management API endpoints.
 */
export interface UserEndpoints {
  /** GET — list all users (paginated). */
  readonly list: string;

  /**
   * GET/PUT/DELETE — single user by ID.
   *
   * Replace `:id` with the actual user identifier.
   */
  readonly detail: string;
}

/**
 * Grouped API endpoint paths.
 */
export interface ApiEndpoints {
  /** Authentication endpoints. */
  readonly auth: AuthEndpoints;

  /** User management endpoints. */
  readonly users: UserEndpoints;
}

/**
 * Retry policy for failed API requests.
 */
export interface RetryPolicy {
  /** Maximum number of retry attempts before giving up. */
  readonly maxRetries: number;

  /** Base delay in milliseconds between retries (exponential backoff). */
  readonly baseDelay: number;

  /** HTTP status codes that should trigger a retry. */
  readonly retryableStatuses: readonly number[];
}

/**
 * Root API configuration shape.
 */
export interface ApiConfigShape {
  /** Base URL for all API requests (no trailing slash). */
  readonly baseUrl: string;

  /** Request timeout in milliseconds. */
  readonly timeout: number;

  /** Default headers sent with every request. */
  readonly defaultHeaders: Readonly<Record<string, string>>;

  /** Grouped endpoint paths. */
  readonly endpoints: ApiEndpoints;

  /** Retry policy for transient failures. */
  readonly retry: RetryPolicy;
}

// ── Config Construction ─────────────────────────────────────────────────────

/**
 * Frozen, typed API configuration.
 *
 * Derives base URL and timeout from {@link AppConfig.api}, then
 * adds endpoint paths, default headers, and retry behavior.
 *
 * @example
 * ```typescript
 * import { ApiConfig } from "@/config/api.config";
 *
 * const response = await fetch(
 *   `${ApiConfig.baseUrl}${ApiConfig.endpoints.auth.login}`,
 *   {
 *     method: "POST",
 *     headers: { ...ApiConfig.defaultHeaders, "Content-Type": "application/json" },
 *     body: JSON.stringify({ email, password }),
 *   },
 * );
 * ```
 */
export const ApiConfig: ApiConfigShape = Object.freeze({
  baseUrl: AppConfig.api.url,
  timeout: AppConfig.api.timeout,

  defaultHeaders: Object.freeze({
    Accept: "application/json",
    "Content-Type": "application/json",
  }),

  endpoints: Object.freeze({
    auth: Object.freeze({
      login: "/auth/login",
      register: "/auth/register",
      refresh: "/auth/refresh",
      logout: "/auth/logout",
      me: "/auth/me",
    }),

    users: Object.freeze({
      list: "/users",
      detail: "/users/:id",
    }),
  }),

  retry: Object.freeze({
    maxRetries: 3,
    baseDelay: 1000,
    retryableStatuses: Object.freeze([408, 429, 500, 502, 503, 504]),
  }),
});
