import type { I18nPathOptions, I18nRouting } from '../create-i18n-routing';
import { I18nRoutingError } from '../errors';
import type { I18nLanguageOf, I18nRoute, I18nRouteFileOf } from '../types';
import { useCurrentLanguage } from './use-current-language';

/**
 * Options for {@link useI18nPath}.
 *
 * @property language - The target language. Defaults to the language of the current location.
 */
export interface UseI18nPathOptions<T extends readonly I18nRoute[]> extends I18nPathOptions {
  readonly language?: I18nLanguageOf<T> | undefined;
}

/**
 * Builds the localized URL path for a route file.
 *
 * @param routing - The routing instance created with `createI18nRouting()`.
 * @param file - The target route file.
 * @param options - Target language, path params, search, and hash.
 * @returns The URL path.
 * @throws {I18nRoutingError} `LANGUAGE_NOT_DETERMINED` if no language is provided and the current
 *   location has no language; `ROUTE_NOT_FOUND` if no page route uses the file.
 */
export function useI18nPath<T extends readonly I18nRoute[]>(
  routing: I18nRouting<T>,
  file: I18nRouteFileOf<T>,
  options: UseI18nPathOptions<T> = {},
): string {
  const currentLanguage = useCurrentLanguage(routing);
  const language = options.language ?? currentLanguage;

  if (language === undefined) {
    throw new I18nRoutingError(
      `The language was not provided and could not be determined from the current location (file [${file}])`,
      'LANGUAGE_NOT_DETERMINED',
    );
  }

  return routing.getPath(file, language, options);
}
