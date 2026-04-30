/**
 * @fileoverview MobileSettingsSyncService — extends settings sync with
 * AsyncStorage caching and bundled fallback for offline support.
 *
 * Implements a three-tier fallback chain for loading settings on mobile:
 * 1. **API fetch** (primary) — live data from the backend
 * 2. **AsyncStorage cache** (secondary) — persisted from last successful fetch
 * 3. **Bundled fallback JSON** (tertiary) — shipped with the app binary
 *
 * This ensures the app always has usable settings even when offline
 * or on first launch before any API call succeeds.
 *
 * @module services/mobile-settings-sync
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Constants ───────────────────────────────────────────────────────────────

/**
 * AsyncStorage key prefix for cached settings data.
 * Each group is stored under `stackra:settings:{group}`.
 */
const CACHE_PREFIX = "stackra:settings:";

/**
 * AsyncStorage key prefix for bundled fallback metadata.
 * Reserved for future use when tracking fallback versions.
 */
const FALLBACK_PREFIX = "stackra:fallback:";

// ── Interfaces ──────────────────────────────────────────────────────────────

/**
 * Configuration for the mobile settings sync service.
 *
 * @example
 * ```typescript
 * const config: MobileSettingsSyncConfig = {
 *   apiBaseUrl: 'https://api.example.com',
 *   groups: ['theme', 'preferences'],
 *   bundledFallbacks: {
 *     theme: { color_primary: '#007a55', color_secondary: '#f4f4f5' },
 *   },
 * };
 * ```
 */
export interface MobileSettingsSyncConfig {
  /** API base URL for fetching settings (e.g. `https://api.example.com`) */
  apiBaseUrl: string;

  /** Settings groups to fetch on initialization */
  groups: string[];

  /**
   * Bundled fallback JSON data keyed by group name.
   * Used as the last resort when both API and AsyncStorage are unavailable.
   */
  bundledFallbacks?: Record<string, Record<string, unknown>>;
}

// ── Service ─────────────────────────────────────────────────────────────────

/**
 * Mobile settings sync service with offline fallback chain.
 *
 * Provides a three-tier data loading strategy optimized for mobile
 * environments where network connectivity is unreliable:
 *
 * 1. **API fetch** — attempts to load fresh data from the backend
 * 2. **AsyncStorage cache** — falls back to the last successfully fetched data
 * 3. **Bundled fallback** — uses JSON data shipped with the app binary
 *
 * On every successful API fetch, the response is persisted to AsyncStorage
 * so it's available for subsequent offline launches.
 *
 * @example
 * ```typescript
 * const service = new MobileSettingsSyncService({
 *   apiBaseUrl: 'https://api.example.com',
 *   groups: ['theme', 'preferences'],
 *   bundledFallbacks: {
 *     theme: { color_primary: '#007a55' },
 *   },
 * });
 *
 * await service.init();
 *
 * const themeSettings = service.get('theme');
 * console.log(themeSettings?.color_primary); // '#007a55' or live value
 * ```
 */
export class MobileSettingsSyncService {
  /** Service configuration including API URL, groups, and fallbacks */
  private config: MobileSettingsSyncConfig;

  /**
   * In-memory cache of loaded settings keyed by group name.
   * Populated during `init()` and updated on `refresh()`.
   */
  private cache: Map<string, Record<string, unknown>> = new Map();

  /**
   * Create a new MobileSettingsSyncService instance.
   *
   * @param config - Service configuration with API URL, groups, and optional bundled fallbacks
   */
  constructor(config: MobileSettingsSyncConfig) {
    this.config = config;
  }

  /**
   * Initialize the service by loading all configured groups.
   *
   * Iterates over each group in the config and attempts to load
   * its values using the three-tier fallback chain. Successfully
   * loaded groups are stored in the in-memory cache.
   *
   * @returns A promise that resolves when all groups have been loaded (or failed)
   *
   * @example
   * ```typescript
   * const service = new MobileSettingsSyncService(config);
   * await service.init();
   * // All groups are now available via service.get()
   * ```
   */
  async init(): Promise<void> {
    for (const group of this.config.groups) {
      // Load each group through the fallback chain
      const values = await this.loadWithFallback(group);

      if (values) {
        this.cache.set(group, values);
      }
    }
  }

  /**
   * Get cached values for a specific settings group.
   *
   * Returns the in-memory cached values loaded during `init()` or
   * `refresh()`. Returns `undefined` if the group was never loaded
   * or all fallback tiers failed.
   *
   * @param group - The settings group key (e.g. `'theme'`, `'preferences'`)
   * @returns The cached settings object, or `undefined` if not available
   *
   * @example
   * ```typescript
   * const theme = service.get('theme');
   * if (theme) {
   *   console.log('Primary color:', theme.color_primary);
   * }
   * ```
   */
  get(group: string): Record<string, unknown> | undefined {
    return this.cache.get(group);
  }

  /**
   * Load settings for a group using the three-tier fallback chain.
   *
   * Attempts each tier in order, returning the first successful result:
   * 1. **API fetch** — `GET {apiBaseUrl}/api/v1/settings/{group}`
   * 2. **AsyncStorage cache** — reads from `stackra:settings:{group}`
   * 3. **Bundled fallback** — reads from `config.bundledFallbacks[group]`
   *
   * On a successful API fetch, the response is also persisted to
   * AsyncStorage for future offline access.
   *
   * @param group - The settings group key to load
   * @returns The loaded settings object, or `null` if all tiers failed
   */
  private async loadWithFallback(group: string): Promise<Record<string, unknown> | null> {
    // ── Tier 1: API fetch (primary) ───────────────────────────────────
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/api/v1/settings/${group}`);

      if (response.ok) {
        const data = await response.json();

        // The API may wrap values in a `data` envelope or return them directly
        const values = data.data ?? data;

        // Persist to AsyncStorage for offline access on next launch
        await this.cacheToStorage(group, values);

        return values;
      }
    } catch {
      // API unreachable — fall through to AsyncStorage cache
    }

    // ── Tier 2: AsyncStorage cache (secondary) ───────────────────────
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${group}`);

      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // AsyncStorage read error — fall through to bundled fallback
    }

    // ── Tier 3: Bundled fallback JSON (tertiary) ─────────────────────
    return this.config.bundledFallbacks?.[group] ?? null;
  }

  /**
   * Persist settings values to AsyncStorage after a successful API fetch.
   *
   * This is a best-effort operation — storage errors are silently caught
   * to avoid disrupting the main data flow. The cached data will be used
   * as a fallback on subsequent launches when the API is unreachable.
   *
   * @param group - The settings group key
   * @param values - The settings values to persist
   */
  private async cacheToStorage(group: string, values: Record<string, unknown>): Promise<void> {
    try {
      await AsyncStorage.setItem(`${CACHE_PREFIX}${group}`, JSON.stringify(values));
    } catch {
      // Best-effort persistence — don't block the caller on storage errors
    }
  }

  /**
   * Re-fetch all groups from the API on network recovery.
   *
   * Delegates to `init()` to re-run the full fallback chain for each
   * group. On a successful API response, the in-memory cache and
   * AsyncStorage are both updated with fresh data.
   *
   * Call this when the app detects network connectivity has been restored
   * (e.g. via NetInfo's connectivity change listener).
   *
   * @returns A promise that resolves when all groups have been refreshed
   *
   * @example
   * ```typescript
   * // In a NetInfo listener
   * NetInfo.addEventListener((state) => {
   *   if (state.isConnected) {
   *     service.refresh();
   *   }
   * });
   * ```
   */
  async refresh(): Promise<void> {
    await this.init();
  }
}
