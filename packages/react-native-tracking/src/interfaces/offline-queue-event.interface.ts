/**
 * @fileoverview QueuedEvent interface — shape of events stored in the mobile offline queue.
 *
 * Defines the data structure for events persisted by {@link MobileOfflineQueueService}
 * when the device has no network connectivity. Events are flushed in FIFO order
 * when connectivity is restored.
 *
 * @module @stackra/react-native-tracking
 * @category Interfaces
 */

/**
 * Shape of an event stored in the mobile offline queue.
 *
 * Contains all data needed to replay the event when connectivity
 * is restored, including the original timestamp for accurate timing.
 *
 * @example
 * ```typescript
 * const event: QueuedEvent = {
 *   eventName: 'screen_view',
 *   params: { screen_name: 'Home' },
 *   timestamp: Date.now(),
 *   type: 'pixel',
 * };
 * ```
 */
export interface QueuedEvent {
  /**
   * The canonical event name (e.g., `'screen_view'`, `'app_open'`).
   */
  eventName: string;

  /**
   * Event-specific parameters as key-value pairs.
   */
  params: Record<string, unknown>;

  /**
   * Optional event ID for deduplication with server-side events.
   */
  eventId?: string;

  /**
   * Unix timestamp (milliseconds) when the event was originally created.
   * Preserved so native SDKs receive accurate timing data on flush.
   */
  timestamp: number;

  /**
   * The type of queued event.
   *
   * - `'pixel'` — a native SDK event to be dispatched via NativeSdkService
   * - `'identity-sync'` — an identity sync request to be POSTed to the backend
   */
  type: "pixel" | "identity-sync";
}
