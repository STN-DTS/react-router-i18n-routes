import type { Params } from 'react-router';
import { useNavigation } from 'react-router';

import type { I18nRouting } from '../create-i18n-routing';
import type { I18nLanguageOf, I18nRoute, I18nRouteFileOf } from '../types';
import { isRouteMatch } from './is-route-match';
import { useCurrentLanguage } from './use-current-language';

/**
 * Options for {@link useIsNavigatingTo}.
 *
 * @property params - When provided, the navigation's params must also equal these values.
 * @property language - The target language. Defaults to the language of the current location.
 */
export interface UseIsNavigatingToOptions<T extends readonly I18nRoute[]> {
  readonly params?: Params | undefined;
  readonly language?: I18nLanguageOf<T> | undefined;
}

/**
 * Whether React Router is loading a navigation to the page route for `file`. Use it to show a
 * pending indicator on a link. Requires a data router (framework mode, `createBrowserRouter()`, or
 * `createMemoryRouter()`).
 *
 * @param routing - The routing instance created with `createI18nRouting()`.
 * @param file - The route file, or `undefined` (which is never navigated to).
 * @param options - Params and language to compare.
 * @returns `true` while the navigation is in the `loading` state.
 */
export function useIsNavigatingTo<T extends readonly I18nRoute[]>(
  routing: I18nRouting<T>,
  file: I18nRouteFileOf<T> | undefined,
  options: UseIsNavigatingToOptions<T> = {},
): boolean {
  const navigation = useNavigation();
  const currentLanguage = useCurrentLanguage(routing);

  if (navigation.state !== 'loading' || navigation.location === undefined) {
    return false;
  }

  const match = routing.findRouteByPath(navigation.location.pathname);
  return isRouteMatch(match, file, options.language ?? currentLanguage, options.params);
}
