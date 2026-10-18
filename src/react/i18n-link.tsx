import type { ForwardedRef, JSX, RefAttributes } from 'react';
import { forwardRef } from 'react';

import type { LinkProps } from 'react-router';
import { Link } from 'react-router';

import type { I18nPathOptions, I18nRouting } from '../create-i18n-routing';
import type { I18nLanguageOf, I18nRoute, I18nRouteFileOf } from '../types';
import { useI18nPath } from './use-i18n-path';

/**
 * Props for {@link I18nLink}: React Router `Link` props (including `ref`), with `to` replaced by an i18n route file.
 *
 * @property routing - The routing instance created with `createI18nRouting()`.
 * @property file - The target route file.
 * @property language - The target language. Defaults to the language of the current location.
 * @property params - Values for the dynamic segments of the route path.
 * @property search - The query string, with or without a leading `?`.
 * @property hash - The URL fragment, with or without a leading `#`.
 */
export type I18nLinkProps<T extends readonly I18nRoute[]> = Omit<LinkProps, 'to'> &
  RefAttributes<HTMLAnchorElement> & {
    readonly routing: I18nRouting<T>;
    readonly file: I18nRouteFileOf<T>;
    readonly language?: I18nLanguageOf<T> | undefined;
    readonly params?: I18nPathOptions['params'];
    readonly search?: I18nPathOptions['search'];
    readonly hash?: I18nPathOptions['hash'];
  };

/**
 * A React Router `Link` to an i18n route file, in the current language unless `language` is provided.
 * Refs are forwarded to the rendered `<a>` element.
 *
 * @throws {I18nRoutingError} See `useI18nPath()`.
 */
export const I18nLink: <const T extends readonly I18nRoute[]>(props: I18nLinkProps<T>) => JSX.Element =
  // forwardRef() (used for React 18 support) erases the generic parameter, so the generic call signature is restored.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  forwardRef(function I18nLink<T extends readonly I18nRoute[]>(
    { routing, file, language, params, search, hash, ...props }: Omit<I18nLinkProps<T>, 'ref'>,
    ref: ForwardedRef<HTMLAnchorElement>,
  ): JSX.Element {
    const to = useI18nPath(routing, file, { language, params, search, hash });
    return <Link {...props} ref={ref} to={to} />;
  }) as <const T extends readonly I18nRoute[]>(props: I18nLinkProps<T>) => JSX.Element;
