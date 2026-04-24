/**
 * Theme Facade
 *
 * Static-style access to the DI-resolved {@link ThemeService}.
 * Wired after `Facade.setApplication(app)` is called during
 * bootstrap in `apps/native/src/bootstrap.ts`.
 *
 * @module facades/theme
 */

import { Facade } from "@stackra/ts-support";
import { THEME_SERVICE } from "@/constants/tokens.constant";
import type { ThemeService } from "@/services/theme.service";

/**
 * Typed proxy to the DI-managed {@link ThemeService} instance.
 *
 * Exposes all public methods of ThemeService (`setTheme`,
 * `toggleTheme`, `getCurrentTheme`) through the facade proxy.
 * Resolves automatically once `Facade.setApplication(app)` has
 * been called during app bootstrap.
 *
 * @example
 * ```typescript
 * import { ThemeFacade } from "@repo/ui";
 *
 * ThemeFacade.setTheme("lavender-dark");
 * ThemeFacade.toggleTheme();
 * const current = ThemeFacade.getCurrentTheme();
 * ```
 */
export const ThemeFacade: ThemeService = Facade.make<ThemeService>(THEME_SERVICE);
