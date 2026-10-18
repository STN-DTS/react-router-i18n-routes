// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';

import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';

import { useCurrentLanguage } from '../../src/react/index';
import { routerAt, routing } from './helpers';

afterEach(() => {
  cleanup();
});

describe('useCurrentLanguage', () => {
  it.each([
    ['/en/dashboard', 'en'],
    ['/fr/page-inconnue', 'fr'],
    ['/api/health', undefined],
  ])('is %s at %s', (pathname, expected) => {
    const { result } = renderHook(() => useCurrentLanguage(routing), { wrapper: routerAt(pathname) });
    expect(result.current).toBe(expected);
    expectTypeOf(result.current).toEqualTypeOf<'en' | 'fr' | undefined>();
  });
});
