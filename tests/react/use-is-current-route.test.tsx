// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';

import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';

import { useIsCurrentRoute } from '../../src/react/index';
import { routerAt, routing } from './helpers';

afterEach(() => {
  cleanup();
});

describe('useIsCurrentRoute', () => {
  it.each([
    ['/en/dashboard', 'routes/protected/dashboard.tsx', true],
    ['/fr/tableau-de-bord', 'routes/protected/dashboard.tsx', true],
    ['/en/dashboard', 'routes/index.tsx', false],
    ['/en/unknown', 'routes/index.tsx', false],
    ['/en/dashboard', undefined, false],
  ] as const)('at %s, %s is current: %s', (pathname, file, expected) => {
    const { result } = renderHook(() => useIsCurrentRoute(routing, file), { wrapper: routerAt(pathname) });
    expect(result.current).toBe(expected);
  });

  it('compares the params of the matched route when params are provided', () => {
    const file = 'routes/protected/case/transaction.tsx';
    const at = routerAt('/en/case/1/transactions/2');

    expect(
      renderHook(() => useIsCurrentRoute(routing, file, { params: { caseId: '1', transactionId: '2', extra: 'x' } }), {
        wrapper: at,
      }).result.current,
    ).toBe(true);
    expect(
      renderHook(() => useIsCurrentRoute(routing, file, { params: { caseId: '1', transactionId: '3' } }), { wrapper: at })
        .result.current,
    ).toBe(false);
    expect(renderHook(() => useIsCurrentRoute(routing, file), { wrapper: at }).result.current).toBe(true);
  });

  it('only accepts known route files', () => {
    // @ts-expect-error -- unknown file
    expectTypeOf(useIsCurrentRoute<typeof routing.routes>).toBeCallableWith(routing, 'routes/unknown.tsx');
    expectTypeOf(useIsCurrentRoute<typeof routing.routes>).toBeCallableWith(routing, 'routes/index.tsx');
  });
});
