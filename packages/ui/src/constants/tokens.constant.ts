/**
 * DI Tokens
 *
 * Symbol-based injection tokens for the UI package's DI-managed
 * services. Used by facades and manual `@Inject()` decorators.
 *
 * @module constants/tokens
 */

/**
 * DI injection token for ThemeService.
 *
 * Used by {@link ThemeFacade} and manual injection to resolve
 * the ThemeService instance from the DI container.
 *
 * @example
 * ```typescript
 * import { Inject } from "@stackra/ts-container";
 * import { THEME_SERVICE } from "@repo/ui";
 * import type { ThemeService } from "@repo/ui";
 *
 * class MyService {
 *   constructor(@Inject(THEME_SERVICE) private themeService: ThemeService) {}
 * }
 * ```
 */
export const THEME_SERVICE = Symbol.for("THEME_SERVICE");
