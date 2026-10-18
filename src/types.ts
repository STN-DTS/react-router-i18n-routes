/**
 * A record of paths for each supported language.
 *
 * @example { en: '/en/about', fr: '/fr/a-propos' }
 */
export type I18nPaths<L extends string = string> = { readonly [K in L]: string };

/**
 * A page route that is served at a different path for each language.
 *
 * @property id - A unique identifier for the route. React Router route ids are derived from it (see `getI18nRouteId()`).
 * @property file - The route module file, relative to the React Router app directory. Used as the route's lookup key.
 * @property paths - The path for each language.
 */
export interface I18nPageRoute<L extends string = string> {
  readonly id: string;
  readonly file: string;
  readonly paths: I18nPaths<L>;
}

/**
 * A pathless layout route that wraps other i18n routes.
 *
 * @property file - The layout route module file, relative to the React Router app directory.
 * @property children - The routes rendered inside the layout.
 */
export interface I18nLayoutRoute<L extends string = string> {
  readonly file: string;
  readonly children: readonly I18nRoute<L>[];
}

/**
 * A layout route or a page route.
 */
export type I18nRoute<L extends string = string> = I18nLayoutRoute<L> | I18nPageRoute<L>;

/**
 * Recursively collects the page routes from a route (or a union of routes).
 *
 * Literal definitions (from `defineI18nRoutes()` or `as const`) have tuple `children`, which are
 * recursed into. Wide types such as `I18nLayoutRoute<'en' | 'fr'>` have array `children` that refer
 * back to themselves, so their page route members are used instead of recursing forever. This keeps
 * the declared language union.
 */
type PageRoutesIn<R> = R extends I18nLayoutRoute
  ? number extends R['children']['length']
    ? Extract<R['children'][number], I18nPageRoute>
    : PageRoutesIn<R['children'][number]>
  : R extends I18nPageRoute
    ? R
    : never;

/**
 * Selects the page routes whose `file` can be `F`. For literal routes this is the route with that
 * file; for wide routes (where `file` is `string`) it is the wide page route type.
 */
type PageRouteForFile<R, F extends string> = R extends I18nPageRoute ? (F extends R['file'] ? R : never) : never;

/**
 * The union of all page routes in a route definition array.
 */
export type I18nPageRouteOf<T extends readonly I18nRoute[]> = PageRoutesIn<T[number]>;

/**
 * The union of all page route files in a route definition array.
 */
export type I18nRouteFileOf<T extends readonly I18nRoute[]> = I18nPageRouteOf<T>['file'];

/**
 * The page route (or routes) in a route definition array for the route file `F`.
 */
export type I18nPageRouteForFile<T extends readonly I18nRoute[], F extends I18nRouteFileOf<T>> = PageRouteForFile<
  I18nPageRouteOf<T>,
  F
>;

/**
 * The union of all page route ids in a route definition array.
 */
export type I18nRouteIdOf<T extends readonly I18nRoute[]> = I18nPageRouteOf<T>['id'];

/**
 * The languages supported by every page route in a route definition array.
 */
export type I18nLanguageOf<T extends readonly I18nRoute[]> = keyof I18nPageRouteOf<T>['paths'] & string;
