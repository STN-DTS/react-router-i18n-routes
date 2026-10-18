import { describe, expect, it } from 'vitest';

import { defineI18nRoutes } from '../src/index';

describe('defineI18nRoutes', () => {
  it('returns the routes unchanged', () => {
    const routes = [{ id: 'A', file: 'a.tsx', paths: { en: '/en/a', fr: '/fr/a' } }] as const;
    expect(defineI18nRoutes(routes)).toBe(routes);
  });
});
