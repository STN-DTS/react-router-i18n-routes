import type { I18nLayoutRoute, I18nPageRoute } from './types';

/**
 * Type guard to determine if a value is an {@link I18nLayoutRoute}.
 *
 * @param obj - The value to check.
 * @returns `true` if the value is an `I18nLayoutRoute`, `false` otherwise.
 */
export function isI18nLayoutRoute(obj: unknown): obj is I18nLayoutRoute {
  return obj !== null && typeof obj === 'object' && 'file' in obj && 'children' in obj;
}

/**
 * Type guard to determine if a value is an {@link I18nPageRoute}.
 *
 * @param obj - The value to check.
 * @returns `true` if the value is an `I18nPageRoute`, `false` otherwise.
 */
export function isI18nPageRoute(obj: unknown): obj is I18nPageRoute {
  return obj !== null && typeof obj === 'object' && 'file' in obj && 'paths' in obj;
}
