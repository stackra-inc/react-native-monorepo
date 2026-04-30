/**
 * @fileoverview ConsentState type — maps consent categories to boolean values.
 *
 * Used by {@link ConsentService} to represent the current consent state.
 * Identical to the frontend `ConsentState` type for cross-platform consistency.
 *
 * @module @stackra/react-native-tracking
 * @category Interfaces
 */

import type { ConsentCategory } from "@/enums/consent-category.enum";

/**
 * Consent state mapping — each category maps to a boolean.
 *
 * All categories default to `false` (denied) until explicitly granted.
 *
 * @example
 * ```typescript
 * const state: ConsentState = {
 *   [ConsentCategory.ANALYTICS]: true,
 *   [ConsentCategory.MARKETING]: false,
 *   [ConsentCategory.FUNCTIONAL]: true,
 * };
 * ```
 */
export type ConsentState = Record<ConsentCategory, boolean>;
