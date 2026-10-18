/**
 * Error codes for {@link I18nRoutingError}.
 *
 * - `INVALID_ROUTES`: the route definitions are inconsistent (duplicate ids or files, or mismatched languages).
 * - `ROUTE_NOT_FOUND`: no page route matches the requested file or pathname.
 * - `LANGUAGE_NOT_DETERMINED`: a language was not provided and could not be determined from the current location.
 */
export type I18nRoutingErrorCode = 'INVALID_ROUTES' | 'LANGUAGE_NOT_DETERMINED' | 'ROUTE_NOT_FOUND';

/**
 * An error thrown by this package.
 */
export class I18nRoutingError extends Error {
  readonly code: I18nRoutingErrorCode;

  constructor(message: string, code: I18nRoutingErrorCode) {
    super(message);
    this.name = 'I18nRoutingError';
    this.code = code;
  }
}
