import type { Params, RouteObject } from 'react-router';
import { createPath, generatePath, matchRoutes, redirect } from 'react-router';

import { I18nRoutingError } from './errors';
import { isI18nLayoutRoute, isI18nPageRoute } from './guards';
import { negotiateLanguage } from './negotiate-language';
import { getI18nRouteId } from './route-id';
import type { I18nLanguageOf, I18nPageRoute, I18nPageRouteForFile, I18nPageRouteOf, I18nRoute, I18nRouteFileOf } from './types';

/**
 * The result of matching a pathname against the i18n routes.
 *
 * @property route - The matched page route.
 * @property language - The language whose path matched.
 * @property params - The dynamic path parameters parsed from the pathname.
 */
export interface I18nRouteMatch<T extends readonly I18nRoute[]> {
  readonly route: I18nPageRouteOf<T>;
  readonly language: I18nLanguageOf<T>;
  readonly params: Params;
}

/**
 * Options used to build a localized URL path.
 *
 * @property params - Values for the dynamic segments of the route path (e.g. `:id`).
 * @property search - The query string, with or without a leading `?`.
 * @property hash - The URL fragment, with or without a leading `#`.
 */
export interface I18nPathOptions {
  readonly params?: Params | undefined;
  readonly search?: URLSearchParams | string | undefined;
  readonly hash?: string | undefined;
}

/**
 * Options used to determine a language.
 *
 * @property acceptLanguage - When the URL path has no language and the resource is a `Request`, fall
 *   back to its `Accept-Language` header (see `negotiateLanguage()`). Defaults to `false`.
 */
export interface I18nLanguageOptions {
  readonly acceptLanguage?: boolean | undefined;
}

/**
 * Options used to translate a URL path into another language.
 *
 * @property search - The query string to append, with or without a leading `?`.
 * @property hash - The URL fragment to append, with or without a leading `#`.
 */
export type I18nTranslatePathOptions = Omit<I18nPathOptions, 'params'>;

/**
 * Options used to build a localized redirect response.
 *
 * @property init - The response status code or `ResponseInit`. Defaults to `302 Found`.
 */
export interface I18nRedirectOptions extends I18nPathOptions {
  readonly init?: number | ResponseInit | undefined;
}

/**
 * Lookups and URL builders bound to a set of i18n route definitions. Create one with {@link createI18nRouting}.
 */
export interface I18nRouting<T extends readonly I18nRoute[]> {
  /** The route definitions this instance was created from. */
  readonly routes: T;

  /** The languages supported by the routes, in the order they are declared in the first page route. */
  readonly languages: readonly I18nLanguageOf<T>[];

  /**
   * Finds the page route for a route file.
   *
   * @param file - The route file (any string is accepted, so unknown values can be tested).
   * @returns The page route, or `undefined` if no page route uses the file.
   */
  readonly findRouteByFile: (file: string) => I18nPageRouteOf<T> | undefined;

  /**
   * Gets the page route for a route file.
   *
   * @param file - The route file.
   * @returns The page route.
   * @throws {I18nRoutingError} `ROUTE_NOT_FOUND` if no page route uses the file.
   */
  readonly getRouteByFile: <F extends I18nRouteFileOf<T>>(file: F) => I18nPageRouteForFile<T, F>;

  /**
   * Matches a pathname against the paths of every page route and language, using React Router's
   * route ranking (static segments win over dynamic segments, which win over splats).
   *
   * @param pathname - The URL pathname (relative to the app's basename).
   * @returns The match, or `undefined` if no page route matches.
   */
  readonly findRouteByPath: (pathname: string) => I18nRouteMatch<T> | undefined;

  /**
   * Matches a pathname against the paths of every page route and language.
   *
   * @param pathname - The URL pathname (relative to the app's basename).
   * @returns The match.
   * @throws {I18nRoutingError} `ROUTE_NOT_FOUND` if no page route matches.
   */
  readonly getRouteByPath: (pathname: string) => I18nRouteMatch<T>;

  /**
   * Determines the language of a URL. Uses the language of the matching page route; when no page
   * route matches, falls back to the first path segment if it is a supported language (e.g. `/fr/...`).
   * With `{ acceptLanguage: true }`, a `Request` whose path has no language falls back to its
   * `Accept-Language` header.
   *
   * @param resource - A pathname, `URL`, or `Request`.
   * @param options - Language detection options.
   * @returns The language, or `undefined` if it cannot be determined.
   */
  readonly getLanguage: (resource: Request | URL | string, options?: I18nLanguageOptions) => I18nLanguageOf<T> | undefined;

  /**
   * Returns the supported languages other than `language`, in declaration order. In a bilingual
   * application, the result has exactly one element.
   *
   * @param language - The current language.
   * @returns The other languages.
   */
  readonly getAlternateLanguages: (language: I18nLanguageOf<T>) => readonly I18nLanguageOf<T>[];

  /**
   * Translates a URL path into another language: matches `pathname` to a page route and builds that
   * route's path in `language`, keeping the matched params. Use it for language switchers and
   * `hreflang` alternate links.
   *
   * @example routing.translatePath('/en/case/42', 'fr') // '/fr/dossier/42'
   * @param pathname - The URL pathname (relative to the app's basename).
   * @param language - The target language.
   * @param options - Search and hash to append.
   * @returns The translated path, or `undefined` if no page route matches `pathname`.
   */
  readonly translatePath: (
    pathname: string,
    language: I18nLanguageOf<T>,
    options?: I18nTranslatePathOptions,
  ) => string | undefined;

  /**
   * Builds the localized URL path for a route file.
   *
   * @param file - The route file.
   * @param language - The target language.
   * @param options - Path params, search, and hash.
   * @returns The URL path, always starting with `/`, including search and hash when provided.
   *   Param values are encoded as React Router's `generatePath()` does, but the static segments,
   *   search, and hash are returned as declared (e.g. `/fr/à-propos`). The result is suitable for
   *   `<Link to>` and `navigate()`; use {@link I18nRouting.redirect} to build a `Location` header.
   * @throws {I18nRoutingError} `ROUTE_NOT_FOUND` if no page route uses the file.
   * @throws {Error} If a required path param is missing.
   */
  readonly getPath: (file: I18nRouteFileOf<T>, language: I18nLanguageOf<T>, options?: I18nPathOptions) => string;

  /**
   * Builds a redirect response to the localized URL path of a route file.
   *
   * @param file - The route file.
   * @param language - The target language.
   * @param options - Path params, search, hash, and response init.
   * @returns A redirect `Response`. Non-ASCII characters in the location (e.g. `/fr/à-propos`) are
   *   percent-encoded; existing percent-escapes are preserved.
   * @throws {I18nRoutingError} `ROUTE_NOT_FOUND` if no page route uses the file.
   */
  readonly redirect: (file: I18nRouteFileOf<T>, language: I18nLanguageOf<T>, options?: I18nRedirectOptions) => Response;
}

/**
 * Creates lookups and URL builders for a set of i18n route definitions.
 *
 * @example
 * export const i18nRoutes = defineI18nRoutes([...]);
 * export const i18nRouting = createI18nRouting(i18nRoutes);
 *
 * @param routes - The i18n route definitions.
 * @returns The routing instance.
 * @throws {I18nRoutingError} `INVALID_ROUTES` if two page routes share an id or a file, if the page
 *   routes do not all declare the same languages, or if two route/language pairs generate the same
 *   React Router route id (see `getI18nRouteId()`).
 */
export function createI18nRouting<const T extends readonly I18nRoute[]>(routes: T): I18nRouting<T> {
  type PageRoute = I18nPageRouteOf<T>;
  type Language = I18nLanguageOf<T>;

  // The runtime values are the page routes and languages of `routes`; TypeScript cannot narrow them generically.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const pageRoutes = collectPageRoutes(routes) as PageRoute[];
  const languages = validatePageRoutes(pageRoutes) as Language[];

  const routesByFile = new Map<string, PageRoute>(pageRoutes.map((route) => [route.file, route]));
  const matchTargetsById = new Map<string, { route: PageRoute; language: Language }>();
  const routeObjects: RouteObject[] = [];

  for (const route of pageRoutes) {
    for (const language of languages) {
      const id = getI18nRouteId(route.id, language);
      // validatePageRoutes() guarantees that every page route has a path for every language.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const path = route.paths[language] as string;
      const existing = matchTargetsById.get(id);

      if (existing !== undefined) {
        throw new I18nRoutingError(
          `Route id [${id}] is generated by both i18n route [${existing.route.id}] (language [${existing.language}]) and i18n route [${route.id}] (language [${language}])`,
          'INVALID_ROUTES',
        );
      }

      matchTargetsById.set(id, { route, language });
      routeObjects.push({ id, path });
    }
  }

  function findRouteByFile(file: string): PageRoute | undefined {
    return routesByFile.get(file);
  }

  function getRouteByFile<F extends I18nRouteFileOf<T>>(file: F): I18nPageRouteForFile<T, F> {
    const route = routesByFile.get(file);

    if (route === undefined) {
      throw new I18nRoutingError(`No i18n route found for file [${file}]`, 'ROUTE_NOT_FOUND');
    }

    // The route was looked up by `file`, so it is the member of the union with that file.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return route as I18nPageRouteForFile<T, F>;
  }

  function findRouteByPath(pathname: string): I18nRouteMatch<T> | undefined {
    const match = matchRoutes(routeObjects, pathname)?.at(-1);
    const target = match?.route.id === undefined ? undefined : matchTargetsById.get(match.route.id);

    if (match === undefined || target === undefined) {
      return undefined;
    }

    return { route: target.route, language: target.language, params: match.params };
  }

  function getRouteByPath(pathname: string): I18nRouteMatch<T> {
    const match = findRouteByPath(pathname);

    if (match === undefined) {
      throw new I18nRoutingError(`No i18n route found for pathname [${pathname}]`, 'ROUTE_NOT_FOUND');
    }

    return match;
  }

  function getLanguage(resource: Request | URL | string, options: I18nLanguageOptions = {}): Language | undefined {
    const pathname = toPathname(resource);
    const firstSegment = pathname.split('/')[1];
    const pathLanguage = findRouteByPath(pathname)?.language ?? languages.find((language) => language === firstSegment);

    if (
      pathLanguage !== undefined ||
      options.acceptLanguage !== true ||
      typeof resource === 'string' ||
      resource instanceof URL
    ) {
      return pathLanguage;
    }

    return negotiateLanguage(resource.headers.get('accept-language'), languages);
  }

  function getAlternateLanguages(language: Language): readonly Language[] {
    return languages.filter((candidate) => candidate !== language);
  }

  function translatePath(pathname: string, language: Language, options: I18nTranslatePathOptions = {}): string | undefined {
    const match = findRouteByPath(pathname);
    return match === undefined
      ? undefined
      : getPath(match.route.file, language, { params: match.params, search: options.search, hash: options.hash });
  }

  function getPath(file: I18nRouteFileOf<T>, language: Language, options: I18nPathOptions = {}): string {
    const route = getRouteByFile(file);
    const path: string | undefined = route.paths[language];

    if (path === undefined) {
      throw new I18nRoutingError(`No path for language [${language}] in i18n route [${route.id}]`, 'ROUTE_NOT_FOUND');
    }

    const generatedPath = generatePath(path, options.params ?? {});
    // Route paths may be declared without a leading slash (e.g. 'en/about'); links must not resolve them relative to the current URL.
    const pathname = generatedPath.startsWith('/') ? generatedPath : `/${generatedPath}`;
    const search = typeof options.search === 'string' ? options.search : (options.search?.toString() ?? '');
    return createPath({ pathname, search, hash: options.hash ?? '' });
  }

  function i18nRedirect(file: I18nRouteFileOf<T>, language: Language, options: I18nRedirectOptions = {}): Response {
    return redirect(encodeLocation(getPath(file, language, options)), options.init);
  }

  return {
    routes,
    languages,
    findRouteByFile,
    getRouteByFile,
    findRouteByPath,
    getRouteByPath,
    getLanguage,
    getAlternateLanguages,
    translatePath,
    getPath,
    redirect: i18nRedirect,
  };
}

function collectPageRoutes(routes: readonly I18nRoute[]): I18nPageRoute[] {
  return routes.flatMap((route) => {
    if (isI18nLayoutRoute(route)) {
      return collectPageRoutes(route.children);
    }

    return isI18nPageRoute(route) ? [route] : [];
  });
}

/**
 * Validates the page routes and returns the languages they declare.
 */
function validatePageRoutes(pageRoutes: readonly I18nPageRoute[]): string[] {
  const languages = Object.keys(pageRoutes[0]?.paths ?? {});
  const ids = new Set<string>();
  const files = new Set<string>();

  for (const route of pageRoutes) {
    if (ids.has(route.id)) {
      throw new I18nRoutingError(`Duplicate i18n route id [${route.id}]`, 'INVALID_ROUTES');
    }

    if (files.has(route.file)) {
      throw new I18nRoutingError(`Duplicate i18n route file [${route.file}]`, 'INVALID_ROUTES');
    }

    const routeLanguages = Object.keys(route.paths);

    if (routeLanguages.length !== languages.length || !languages.every((language) => routeLanguages.includes(language))) {
      throw new I18nRoutingError(
        `i18n route [${route.id}] declares languages [${routeLanguages.join(', ')}]; expected [${languages.join(', ')}]`,
        'INVALID_ROUTES',
      );
    }

    ids.add(route.id);
    files.add(route.file);
  }

  return languages;
}

/**
 * Percent-encodes the characters that are not allowed in a `Location` header (non-ASCII, whitespace,
 * and control characters), leaving existing percent-escapes and URL delimiters untouched.
 */
function encodeLocation(path: string): string {
  return path.replace(/[^\x21-\x7E]+/gu, (characters) => encodeURI(characters));
}

function toPathname(resource: Request | URL | string): string {
  if (typeof resource === 'string') {
    return resource;
  }

  return resource instanceof URL ? resource.pathname : new URL(resource.url).pathname;
}
