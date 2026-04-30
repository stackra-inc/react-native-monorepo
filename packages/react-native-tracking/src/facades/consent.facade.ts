/**
 * Mobile Consent Facade
 *
 * Typed proxy for {@link ConsentService} from `@stackra/react-native-tracking`.
 *
 * Manages user consent state for mobile tracking operations.
 *
 * ## Usage
 *
 * ```typescript
 * import { ConsentFacade } from '@stackra/react-native-tracking';
 * import { ConsentCategory } from '@stackra/react-native-tracking';
 *
 * ConsentFacade.grantConsent(ConsentCategory.MARKETING);
 * ConsentFacade.hasConsent(ConsentCategory.MARKETING); // true
 * ```
 *
 * @module facades/consent
 * @see {@link ConsentService} — the underlying service
 */

import { Facade } from "@stackra/ts-support";

import { CONSENT_SERVICE } from "@/constants/tokens.constant";
import type { ConsentService } from "@/services/consent.service";

/**
 * ConsentFacade — typed proxy for the mobile {@link ConsentService}.
 *
 * Resolves `ConsentService` from the DI container via the `CONSENT_SERVICE` token.
 *
 * @example
 * ```typescript
 * ConsentFacade.grantConsent(ConsentCategory.MARKETING);
 * ```
 */
export const ConsentFacade: ConsentService = Facade.make<ConsentService>(CONSENT_SERVICE);
