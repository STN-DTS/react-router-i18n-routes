import { useLocation } from 'react-router';

import type { I18nRouting } from '../create-i18n-routing';
import type { I18nLanguageOf, I18nRoute } from '../types';
import { useLanguage } from './use-language';

/**
 * Builds the path of the current page in another language, keeping its params, search, and hash
 * (see `I18nRouting.translatePath()`).
 *
 * @param routing - The routing instance created with `createI18nRouting()`.
 * @param language - The target language. Defaults to the alternate language of a bilingual application.
 * @returns The path, or `undefined` if the current location is not an i18n page route or there is no
 *   target language.
 */
export function useLanguageSwitchPath<T extends readonly I18nRoute[]>(
  routing: I18nRouting<T>,
  language?: I18nLanguageOf<T>,
): string | undefined {
  const { pathname, search, hash } = useLocation();
  const { alternateLanguage } = useLanguage(routing);
  const targetLanguage = language ?? alternateLanguage;

  return targetLanguage === undefined ? undefined : routing.translatePath(pathname, targetLanguage, { search, hash });
}
