/**
 * Components Barrel Export
 *
 * Consent-related UI components for the mobile tracking package.
 *
 * - {@link ConsentBanner} — Dialog-based consent prompt
 * - {@link ConsentManager} — per-category consent toggle UI
 * - {@link ConsentGate} — conditional rendering based on consent state
 *
 * All HeroUI Native components are imported from `@repo/ui` per the
 * architecture guidelines — never directly from `heroui-native`.
 *
 * @module components
 */

// ─── Consent Banner ────────────────────────────────────────────────
export { ConsentBanner } from "./consent-banner";
export type { ConsentBannerProps } from "./consent-banner";

// ─── Consent Manager ───────────────────────────────────────────────
export { ConsentManager } from "./consent-manager";
export type { ConsentManagerProps, ConsentCategoryConfig } from "./consent-manager";

// ─── Consent Gate ──────────────────────────────────────────────────
export { ConsentGate } from "./consent-gate";
export type { ConsentGateProps } from "./consent-gate";
