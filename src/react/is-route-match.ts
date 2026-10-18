import type { Params } from 'react-router';

import type { I18nRouteMatch } from '../create-i18n-routing';
import type { I18nRoute } from '../types';

/**
 * Whether a route match is for `file`, and (when provided) for `language` and with the same values
 * for every param of the matched route. Extra entries in `params` (e.g. from `useParams()`) are ignored.
 */
export function isRouteMatch<T extends readonly I18nRoute[]>(
  match: I18nRouteMatch<T> | undefined,
  file: string | undefined,
  language: string | undefined,
  params: Params | undefined,
): boolean {
  if (match === undefined || file === undefined || match.route.file !== file) {
    return false;
  }

  if (language !== undefined && match.language !== language) {
    return false;
  }

  return params === undefined || Object.entries(match.params).every(([key, value]) => params[key] === value);
}
