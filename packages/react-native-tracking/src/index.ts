/**
 * @stackra/react-native-tracking — Mobile Engagement Tracking for React Native
 *
 * Provides native SDK management, identity sync, consent management, offline
 * event queuing, and engagement event tracking (app open, screen view, deep
 * link, push notification open) for React Native applications. Commerce events
 * are handled exclusively by the backend tracking module.
 *
 * @module @stackra/react-native-tracking
 */

import "reflect-metadata";

export { MobileTrackingModule } from "./tracking.module";

// ============================================================================
// Hooks
// ============================================================================
export * from "./hooks";

// ============================================================================
// Services
// ============================================================================
export * from "./services";

// ============================================================================
// Interfaces
// ============================================================================
export * from "./interfaces";

// ============================================================================
// Enums
// ============================================================================
export * from "./enums";

// ============================================================================
// Constants
// ============================================================================
export * from "./constants";

// ============================================================================
// Components
// ============================================================================
export * from "./components";

// ============================================================================
// Contexts
// ============================================================================
export * from "./contexts";

// ============================================================================
// Providers
// ============================================================================
export * from "./providers";

// ============================================================================
// Facades
// ============================================================================
export { MobileTrackingFacade, ConsentFacade } from "./facades";
