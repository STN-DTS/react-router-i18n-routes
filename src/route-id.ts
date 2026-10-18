/**
 * Returns the React Router route id for one language of an i18n page route.
 *
 * @example getI18nRouteId('DASH-0001', 'fr') // 'DASH-0001-FR'
 * @param id - The i18n page route id.
 * @param language - The language.
 * @returns The React Router route id.
 */
export function getI18nRouteId(id: string, language: string): string {
  return `${id}-${language.toUpperCase()}`;
}
