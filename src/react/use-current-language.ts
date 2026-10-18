import { useLocation } from 'react-router';

import type { I18nRouting } from '../create-i18n-routing';
import type { I18nLanguageOf, I18nRoute } from '../types';

/**
 * Determines the language of the current location (see `I18nRouting.getLanguage()`).
 *
 * @param routing - The routing instance created with `createI18nRouting()`.
 * @returns The language, or `undefined` if it cannot be determined.
 */
export function useCurrentLanguage<T extends readonly I18nRoute[]>(routing: I18nRouting<T>): I18nLanguageOf<T> | undefined {
  const { pathname } = useLocation();
  return routing.getLanguage(pathname);
}
