// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';

import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';

import { createI18nRouting } from '../../src/index';
import { useLanguage } from '../../src/react/index';
import { routerAt, routing } from './helpers';

afterEach(() => {
  cleanup();
});

describe('useLanguage', () => {
  it.each([
    ['/en/dashboard', { currentLanguage: 'en', alternateLanguage: 'fr', alternateLanguages: ['fr'] }],
    ['/fr/page-inconnue', { currentLanguage: 'fr', alternateLanguage: 'en', alternateLanguages: ['en'] }],
    ['/api/health', { currentLanguage: undefined, alternateLanguage: undefined, alternateLanguages: [] }],
  ])('at %s', (pathname, expected) => {
    const { result } = renderHook(() => useLanguage(routing), { wrapper: routerAt(pathname) });
    expect(result.current).toEqual(expected);
    expectTypeOf(result.current.alternateLanguage).toEqualTypeOf<'en' | 'fr' | undefined>();
  });

  it('has no single alternate language when there are more than two languages', () => {
    const trilingual = createI18nRouting([{ id: 'A', file: 'a.tsx', paths: { en: '/en/a', fr: '/fr/a', iu: '/iu/a' } }]);
    const { result } = renderHook(() => useLanguage(trilingual), { wrapper: routerAt('/fr/a') });

    expect(result.current).toEqual({ currentLanguage: 'fr', alternateLanguage: undefined, alternateLanguages: ['en', 'iu'] });
  });
});
