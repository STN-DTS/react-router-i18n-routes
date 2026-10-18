import type { RouteConfigEntry } from '@react-router/dev/routes';
import { layout, route } from '@react-router/dev/routes';

import { isI18nPageRoute } from '../guards';
import { getI18nRouteId } from '../route-id';
import type { I18nPageRoute, I18nRoute } from '../types';

/**
 * Converts an i18n page route into one React Router route config entry per language. Each entry's
 * id is derived with {@link getI18nRouteId} (e.g. `DASH-0001-EN`).
 *
 * @param i18nPageRoute - The i18n page route.
 * @returns The route config entries.
 */
export function toPageRouteConfigEntries(i18nPageRoute: I18nPageRoute): RouteConfigEntry[] {
  return Object.entries(i18nPageRoute.paths).map(([language, path]) => {
    return route(path, i18nPageRoute.file, { id: getI18nRouteId(i18nPageRoute.id, language) });
  });
}

/**
 * Recursively converts i18n route definitions into React Router route config entries for use in
 * `app/routes.ts`. Layout routes become pathless `layout()` entries and page routes become one
 * `route()` entry per language.
 *
 * @example
 * export default [...toRouteConfigEntries(i18nRoutes)] satisfies RouteConfig;
 *
 * @param routes - The i18n route definitions.
 * @returns The route config entries.
 */
export function toRouteConfigEntries(routes: readonly I18nRoute[]): RouteConfigEntry[] {
  return routes.flatMap((i18nRoute) => {
    return isI18nPageRoute(i18nRoute)
      ? toPageRouteConfigEntries(i18nRoute)
      : layout(i18nRoute.file, toRouteConfigEntries(i18nRoute.children));
  });
}
