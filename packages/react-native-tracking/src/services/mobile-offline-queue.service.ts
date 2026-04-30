/**
 * @fileoverview MobileOfflineQueueService — persists tracking events when device is offline.
 *
 * Detects connectivity via `@react-native-community/netinfo` (optional peer
 * dependency), persists events to AsyncStorage, and flushes them in FIFO
 * order when connectivity is restored.
 *
 * @module @stackra/react-native-tracking
 * @category Services
 */

import { Injectable, Inject } from "@stackra/ts-container";

import { TRACKING_CONFIG } from "@/constants/tokens.constant";
import type { QueuedEvent } from "@/interfaces/offline-queue-event.interface";
import type { MobileTrackingConfig } from "@/interfaces/tracking-config.interface";

/** AsyncStorage key for the offline event queue. */
const STORAGE_KEY = "@stackra:tracking:offline-queue";

/** Default maximum number of events to store. */
const DEFAULT_MAX_SIZE = 500;

/**
 * MobileOfflineQueueService — queues tracking events when the device is offline.
 *
 * Detects connectivity via `@react-native-community/netinfo`. When offline,
 * events are persisted to AsyncStorage. When connectivity is restored, they
 * flush in FIFO order via a provided dispatcher callback.
 *
 * @example
 * ```typescript
 * const queue = container.get<MobileOfflineQueueService>(OFFLINE_QUEUE);
 * if (!queue.isOnline()) {
 *   queue.enqueue({ eventName: 'screen_view', params: {}, timestamp: Date.now(), type: 'pixel' });
 * }
 * ```
 */
@Injectable()
export class MobileOfflineQueueService {
  /** In-memory queue of events waiting to be flushed. */
  private queue: QueuedEvent[] = [];

  /** Whether the queue has been restored from persistent storage. */
  private restored: boolean = false;

  /** Current online status. Defaults to `true` until NetInfo reports otherwise. */
  private online: boolean = true;

  /** Maximum number of events to store. */
  private readonly maxSize: number;

  /** NetInfo unsubscribe function, if available. */
  private netInfoUnsubscribe: (() => void) | null = null;

  /**
   * Create a new MobileOfflineQueueService instance.
   *
   * Attempts to import `@react-native-community/netinfo` for connectivity
   * detection. Falls back to assuming online if the module is not available.
   * Restores any previously persisted queue from AsyncStorage.
   *
   * @param config - The mobile tracking configuration injected via DI.
   */
  public constructor(@Inject(TRACKING_CONFIG) private readonly config: MobileTrackingConfig) {
    this.maxSize = DEFAULT_MAX_SIZE;

    // Restore persisted queue
    this.restore();

    // Set up connectivity listener
    this.setupNetInfo();
  }

  /**
   * Check whether the device is currently online.
   *
   * @returns `true` if the device has network connectivity.
   */
  public isOnline(): boolean {
    return this.online;
  }

  /**
   * Add an event to the offline queue.
   *
   * Enforces the maximum queue size by discarding the oldest events
   * when the limit is exceeded. Persists the updated queue to AsyncStorage.
   *
   * @param event - The event to queue.
   * @returns void
   */
  public enqueue(event: QueuedEvent): void {
    this.queue.push(event);

    // Discard oldest events when the queue exceeds max size
    while (this.queue.length > this.maxSize) {
      this.queue.shift();
    }

    this.persist();
  }

  /**
   * Flush all queued events in FIFO order via the provided dispatcher.
   *
   * Clears the queue and persisted storage after flushing. Each event
   * is passed to the dispatcher callback for replay.
   *
   * @param dispatcher - Callback that replays a single queued event.
   * @returns void
   */
  public flush(dispatcher: (event: QueuedEvent) => void): void {
    const events = [...this.queue];
    this.queue = [];
    this.persist();

    for (const event of events) {
      dispatcher(event);
    }
  }

  /**
   * Get the current number of events in the queue.
   *
   * @returns The queue size.
   */
  public getQueueSize(): number {
    return this.queue.length;
  }

  // ── Private Helpers ───────────────────────────────────────────────

  /**
   * Set up connectivity detection via NetInfo.
   *
   * Dynamically imports `@react-native-community/netinfo` and subscribes
   * to connectivity changes. Falls back gracefully if the module is not
   * installed.
   */
  private async setupNetInfo(): Promise<void> {
    try {
      const NetInfo = await import("@react-native-community/netinfo");
      const netInfoModule = NetInfo.default ?? NetInfo;

      this.netInfoUnsubscribe = netInfoModule.addEventListener(
        (state: { isConnected: boolean | null }) => {
          this.online = state.isConnected !== false;
        },
      );

      // Get initial state
      const initialState = await netInfoModule.fetch();
      this.online = initialState.isConnected !== false;
    } catch {
      // NetInfo not installed — assume online
      this.online = true;
    }
  }

  /**
   * Persist the current queue to AsyncStorage.
   *
   * Uses AsyncStorage for persistence. Failures are silently swallowed.
   */
  private async persist(): Promise<void> {
    try {
      const AsyncStorage = await this.getAsyncStorage();
      if (AsyncStorage) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
      }
    } catch {
      // Storage unavailable — events will be lost on app restart
    }
  }

  /**
   * Restore the queue from AsyncStorage.
   *
   * Called once during construction to recover events that were
   * persisted before an app restart or background kill.
   */
  private async restore(): Promise<void> {
    if (this.restored) return;
    this.restored = true;

    try {
      const AsyncStorage = await this.getAsyncStorage();
      if (!AsyncStorage) return;

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.queue = parsed;
        }
      }
    } catch {
      // Corrupted data — start with empty queue
    }
  }

  /**
   * Dynamically import AsyncStorage.
   *
   * Tries `@react-native-async-storage/async-storage` first.
   * Returns `null` if not available.
   *
   * @returns The AsyncStorage module, or `null` if unavailable.
   */
  private async getAsyncStorage(): Promise<{
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
  } | null> {
    try {
      const module = await import("@react-native-async-storage/async-storage");
      return module.default ?? module;
    } catch {
      return null;
    }
  }
}
