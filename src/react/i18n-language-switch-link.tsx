import type { ForwardedRef, JSX, RefAttributes } from 'react';
import { forwardRef } from 'react';

import type { LinkProps } from 'react-router';
import { Link } from 'react-router';

import type { I18nRouting } from '../create-i18n-routing';
import type { I18nLanguageOf, I18nRoute } from '../types';
import { useLanguage } from './use-language';
import { useLanguageSwitchPath } from './use-language-switch-path';

/**
 * Props for {@link I18nLanguageSwitchLink}: React Router `Link` props (including `ref`), with `to`
 * replaced by a target language.
 *
 * @property routing - The routing instance created with `createI18nRouting()`.
 * @property language - The target language. Defaults to the alternate language of a bilingual application.
 */
export type I18nLanguageSwitchLinkProps<T extends readonly I18nRoute[]> = Omit<LinkProps, 'to'> &
  RefAttributes<HTMLAnchorElement> & {
    readonly routing: I18nRouting<T>;
    readonly language?: I18nLanguageOf<T> | undefined;
  };

/**
 * An unstyled React Router `Link` to the current page in another language, keeping its params,
 * search, and hash. Sets `lang` and `hrefLang` to the target language (override them with props).
 * Renders nothing when the current location is not an i18n page route or there is no target language.
 *
 * If translations are loaded per document, pass `reloadDocument` to switch languages with a full page load.
 */
export const I18nLanguageSwitchLink: <const T extends readonly I18nRoute[]>(
  props: I18nLanguageSwitchLinkProps<T>,
) => JSX.Element | null =
  // forwardRef() (used for React 18 support) erases the generic parameter, so the generic call signature is restored.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  forwardRef(function I18nLanguageSwitchLink<T extends readonly I18nRoute[]>(
    { routing, language, ...props }: Omit<I18nLanguageSwitchLinkProps<T>, 'ref'>,
    ref: ForwardedRef<HTMLAnchorElement>,
  ): JSX.Element | null {
    const { alternateLanguage } = useLanguage(routing);
    const targetLanguage = language ?? alternateLanguage;
    const to = useLanguageSwitchPath(routing, targetLanguage);

    if (to === undefined || targetLanguage === undefined) {
      return null;
    }

    return <Link lang={targetLanguage} hrefLang={targetLanguage} {...props} ref={ref} to={to} />;
  }) as <const T extends readonly I18nRoute[]>(props: I18nLanguageSwitchLinkProps<T>) => JSX.Element | null;
