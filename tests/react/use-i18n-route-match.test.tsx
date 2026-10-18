// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';

import { afterEach, describe, expect, it } from 'vitest';

import { useI18nRouteMatch } from '../../src/react/index';
import { routerAt, routing } from './helpers';

afterEach(() => {
  cleanup();
});

describe('useI18nRouteMatch', () => {
  it('matches the current location', () => {
    const { result } = renderHook(() => useI18nRouteMatch(routing), {
      wrapper: routerAt('/fr/dossier/7/transactions/nouvelle'),
    });
    expect(result.current?.route.id).toBe('CASE-0002');
    expect(result.current?.language).toBe('fr');
    expect(result.current?.params).toEqual({ caseId: '7' });
  });

  it('returns undefined outside the i18n routes', () => {
    const { result } = renderHook(() => useI18nRouteMatch(routing), { wrapper: routerAt('/api/health') });
    expect(result.current).toBeUndefined();
  });
});
