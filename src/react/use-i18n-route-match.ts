import { useLocation } from 'react-router';

import type { I18nRouteMatch, I18nRouting } from '../create-i18n-routing';
import type { I18nRoute } from '../types';

/**
 * Matches the current location against the i18n routes.
 *
 * @param routing - The routing instance created with `createI18nRouting()`.
 * @returns The match, or `undefined` if the current location is not an i18n page route.
 */
export function useI18nRouteMatch<T extends readonly I18nRoute[]>(routing: I18nRouting<T>): I18nRouteMatch<T> | undefined {
  const { pathname } = useLocation();
  return routing.findRouteByPath(pathname);
}
