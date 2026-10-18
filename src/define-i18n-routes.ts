import type { I18nRoute } from './types';

/**
 * Declares i18n route definitions while preserving their literal types, so that route files, ids,
 * and languages can be extracted with `I18nRouteFileOf`, `I18nRouteIdOf`, and `I18nLanguageOf`.
 * There is no need to add `as const`.
 *
 * At runtime, this function returns its argument unchanged.
 *
 * @param routes - The i18n route definitions.
 * @returns The same route definitions, typed as literals.
 */
export function defineI18nRoutes<const T extends readonly I18nRoute[]>(routes: T): T {
  return routes;
}
