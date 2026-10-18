import type { ReactNode } from 'react';

import { MemoryRouter } from 'react-router';

import { createI18nRouting } from '../../src/index';
import { i18nRoutes } from '../fixtures';

export const routing = createI18nRouting(i18nRoutes);

/**
 * Returns a `renderHook()`/`render()` wrapper that renders inside a `MemoryRouter` at `pathname`.
 */
export function routerAt(pathname: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>;
  };
}
