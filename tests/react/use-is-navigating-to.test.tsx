// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';

import type { Params } from 'react-router';
import { Outlet, RouterProvider, createMemoryRouter } from 'react-router';

import { afterEach, describe, expect, it } from 'vitest';

import type { I18nRouteFileOf } from '../../src/index';
import type { UseIsNavigatingToOptions } from '../../src/react/index';
import { useIsNavigatingTo } from '../../src/react/index';
import type { i18nRoutes } from '../fixtures';
import { routing } from './helpers';

type File = I18nRouteFileOf<typeof i18nRoutes>;

afterEach(() => {
  cleanup();
});

/**
 * Renders a probe at `initialPath`, starts a navigation to `targetPath` whose loader never settles,
 * and returns the probe's value while the navigation is loading.
 */
async function isNavigatingDuring(
  targetPath: string,
  file: File | undefined,
  options?: UseIsNavigatingToOptions<typeof i18nRoutes>,
  initialPath = '/en/',
): Promise<boolean> {
  function Probe() {
    return <output>{String(useIsNavigatingTo(routing, file, options))}</output>;
  }

  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <>
            <Probe />
            <Outlet />
          </>
        ),
        children: [
          { path: 'en', element: null },
          { path: 'fr', element: null },
          // Every other page has a loader that never settles, so navigations stay in the loading state.
          { path: '*', loader: () => new Promise<never>(() => {}), element: null },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );

  const { unmount } = render(<RouterProvider router={router} />);
  expect(screen.getByRole('status').textContent).toBe('false');

  await act(async () => {
    void router.navigate(targetPath);
    await Promise.resolve();
  });

  expect(router.state.navigation.state).toBe('loading');
  const isNavigating = screen.getByRole('status').textContent === 'true';
  unmount();
  router.dispose();
  return isNavigating;
}

const transaction: File = 'routes/protected/case/transaction.tsx';
const params = (transactionId: string): Params => ({ caseId: '1', transactionId, extra: 'ignored' });

describe('useIsNavigatingTo', () => {
  it('is true while loading the route in the current language', async () => {
    expect(await isNavigatingDuring('/en/dashboard', 'routes/protected/dashboard.tsx')).toBe(true);
  });

  it('is false for another route', async () => {
    expect(await isNavigatingDuring('/en/dashboard', 'routes/index.tsx')).toBe(false);
  });

  it('is false when the file is undefined', async () => {
    expect(await isNavigatingDuring('/en/dashboard', undefined)).toBe(false);
  });

  it('compares the language with the current language unless one is provided', async () => {
    expect(await isNavigatingDuring('/fr/tableau-de-bord', 'routes/protected/dashboard.tsx')).toBe(false);
    expect(await isNavigatingDuring('/fr/tableau-de-bord', 'routes/protected/dashboard.tsx', { language: 'fr' })).toBe(true);
  });

  it('compares the params of the matched route when params are provided', async () => {
    expect(await isNavigatingDuring('/en/case/1/transactions/2', transaction, { params: params('2') })).toBe(true);
    expect(await isNavigatingDuring('/en/case/1/transactions/2', transaction, { params: params('3') })).toBe(false);
    expect(await isNavigatingDuring('/en/case/1/transactions/2', transaction)).toBe(true);
  });
});
