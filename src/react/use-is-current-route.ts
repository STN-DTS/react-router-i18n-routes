import type { Params } from 'react-router';

import type { I18nRouting } from '../create-i18n-routing';
import type { I18nRoute, I18nRouteFileOf } from '../types';
import { isRouteMatch } from './is-route-match';
import { useI18nRouteMatch } from './use-i18n-route-match';

/**
 * Options for {@link useIsCurrentRoute}.
 *
 * @property params - When provided, the current location's params must also equal these values.
 */
export interface UseIsCurrentRouteOptions {
  readonly params?: Params | undefined;
}

/**
 * Whether the current location is the page route for `file`, in any language. Use it to set
 * `aria-current="page"` on navigation links.
 *
 * @param routing - The routing instance created with `createI18nRouting()`.
 * @param file - The route file, or `undefined` (which is never current).
 * @param options - Params to compare.
 * @returns `true` if the current location matches the route.
 */
export function useIsCurrentRoute<T extends readonly I18nRoute[]>(
  routing: I18nRouting<T>,
  file: I18nRouteFileOf<T> | undefined,
  options: UseIsCurrentRouteOptions = {},
): boolean {
  const match = useI18nRouteMatch(routing);
  return isRouteMatch(match, file, undefined, options.params);
}
