import { describe, expect, it } from 'vitest';

import { getI18nRouteId } from '../src/index';

describe('getI18nRouteId', () => {
  it('appends the upper-cased language to the route id', () => {
    expect(getI18nRouteId('DASH-0001', 'en')).toBe('DASH-0001-EN');
    expect(getI18nRouteId('DASH-0001', 'fr')).toBe('DASH-0001-FR');
  });
});
