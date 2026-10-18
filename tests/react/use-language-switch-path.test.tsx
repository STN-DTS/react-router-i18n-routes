// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';

import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';

import { createI18nRouting } from '../../src/index';
import { useLanguageSwitchPath } from '../../src/react/index';
import { routerAt, routing } from './helpers';

afterEach(() => {
  cleanup();
});

describe('useLanguageSwitchPath', () => {
  it('returns the current page in the alternate language, keeping params, search, and hash', () => {
    const { result } = renderHook(() => useLanguageSwitchPath(routing), {
      wrapper: routerAt('/en/case/1/transactions/2?tab=notes#history'),
    });

    expect(result.current).toBe('/fr/dossier/1/transactions/2?tab=notes#history');
  });

  it('uses the requested language', () => {
    const { result } = renderHook(() => useLanguageSwitchPath(routing, 'en'), { wrapper: routerAt('/en/dashboard') });
    expect(result.current).toBe('/en/dashboard');
  });

  it('returns undefined outside the i18n routes', () => {
    const { result } = renderHook(() => useLanguageSwitchPath(routing), { wrapper: routerAt('/fr/page-inconnue') });
    expect(result.current).toBeUndefined();
  });

  it('requires a language when there is more than one alternate language', () => {
    const trilingual = createI18nRouting([{ id: 'A', file: 'a.tsx', paths: { en: '/en/a', fr: '/fr/a', iu: '/iu/a' } }]);

    expect(renderHook(() => useLanguageSwitchPath(trilingual), { wrapper: routerAt('/en/a') }).result.current).toBeUndefined();
    expect(renderHook(() => useLanguageSwitchPath(trilingual, 'iu'), { wrapper: routerAt('/en/a') }).result.current).toBe(
      '/iu/a',
    );
  });

  it('only accepts supported languages', () => {
    expectTypeOf(useLanguageSwitchPath<typeof routing.routes>).toBeCallableWith(routing, 'fr');
    // @ts-expect-error -- unknown language
    expectTypeOf(useLanguageSwitchPath<typeof routing.routes>).toBeCallableWith(routing, 'de');
  });
});
