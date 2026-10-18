import type { I18nRouting } from '../create-i18n-routing';
import type { I18nLanguageOf, I18nRoute } from '../types';
import { useCurrentLanguage } from './use-current-language';

/**
 * The languages of the current location.
 *
 * @property currentLanguage - The language of the current location, or `undefined` if it cannot be determined.
 * @property alternateLanguages - The other supported languages, in declaration order (empty if the
 *   current language is `undefined`).
 * @property alternateLanguage - The only other supported language, for bilingual applications;
 *   `undefined` if the current language is `undefined` or there is more than one other language.
 */
export interface I18nLanguageState<T extends readonly I18nRoute[]> {
  readonly currentLanguage: I18nLanguageOf<T> | undefined;
  readonly alternateLanguage: I18nLanguageOf<T> | undefined;
  readonly alternateLanguages: readonly I18nLanguageOf<T>[];
}

/**
 * Returns the language of the current location and the other supported languages.
 *
 * @param routing - The routing instance created with `createI18nRouting()`.
 * @returns The current and alternate languages.
 */
export function useLanguage<T extends readonly I18nRoute[]>(routing: I18nRouting<T>): I18nLanguageState<T> {
  const currentLanguage = useCurrentLanguage(routing);
  const alternateLanguages = currentLanguage === undefined ? [] : routing.getAlternateLanguages(currentLanguage);
  const alternateLanguage = alternateLanguages.length === 1 ? alternateLanguages[0] : undefined;

  return { currentLanguage, alternateLanguage, alternateLanguages };
}
