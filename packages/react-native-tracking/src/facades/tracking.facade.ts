/**
 * Mobile Tracking Facade
 *
 * Typed proxy for {@link MobileTrackingService} from `@stackra/react-native-tracking`.
 *
 * Mobile engagement tracking service. Handles app open, screen view,
 * deep link, and push notification open events across configured native SDKs.
 *
 * The facade is a module-level constant typed as `IMobileTrackingService`.
 * It lazily resolves the service from the DI container on first property
 * access — safe to use at module scope before bootstrap completes.
 *
 * ## Setup (once, in App.tsx)
 *
 * ```typescript
 * import { Application } from '@stackra/ts-container';
 * import { Facade } from '@stackra/ts-support';
 *
 * const app = await Application.create(AppModule);
 * Facade.setApplication(app); // wires all facades
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { MobileTrackingFacade } from '@stackra/react-native-tracking';
 *
 * // Full autocomplete — no .proxy() call needed
 * MobileTrackingFacade.trackAppOpen();
 * MobileTrackingFacade.trackScreenView('HomeScreen');
 * ```
 *
 * ## Available methods (from {@link IMobileTrackingService})
 *
 * - `trackAppOpen(): void`
 * - `trackScreenView(screenName: string, screenClass?: string): void`
 * - `trackDeepLink(url: string): void`
 * - `trackPushOpen(notificationId?: string, campaign?: string): void`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { TRACKING_SERVICE } from '@/constants/tokens.constant';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(TRACKING_SERVICE, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/tracking
 * @see {@link MobileTrackingService} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from "@stackra/ts-support";

import { TRACKING_SERVICE } from "@/constants/tokens.constant";
import type { IMobileTrackingService } from "@/interfaces/tracking-service.interface";

/**
 * MobileTrackingFacade — typed proxy for {@link MobileTrackingService}.
 *
 * Resolves `MobileTrackingService` from the DI container via the `TRACKING_SERVICE` token.
 * All property and method access is forwarded to the resolved instance
 * with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * MobileTrackingFacade.trackAppOpen();
 * MobileTrackingFacade.trackScreenView('ProductDetail', 'ProductDetailScreen');
 * ```
 */
export const MobileTrackingFacade: IMobileTrackingService =
  Facade.make<IMobileTrackingService>(TRACKING_SERVICE);
