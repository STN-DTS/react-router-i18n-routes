// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';

import { afterEach, describe, expect, it } from 'vitest';

import { I18nRoutingError } from '../../src/index';
import { useI18nPath } from '../../src/react/index';
import { routerAt, routing } from './helpers';

afterEach(() => {
  cleanup();
});

describe('useI18nPath', () => {
  it('defaults to the current language', () => {
    const { result } = renderHook(() => useI18nPath(routing, 'routes/protected/dashboard.tsx'), {
      wrapper: routerAt('/fr/'),
    });
    expect(result.current).toBe('/fr/tableau-de-bord');
  });

  it('uses the provided language, params, search, and hash', () => {
    const { result } = renderHook(
      () =>
        useI18nPath(routing, 'routes/protected/case/transaction.tsx', {
          language: 'en',
          params: { caseId: '1', transactionId: '2' },
          search: 'tab=notes',
          hash: 'top',
        }),
      { wrapper: routerAt('/fr/') },
    );
    expect(result.current).toBe('/en/case/1/transactions/2?tab=notes#top');
  });

  it('throws LANGUAGE_NOT_DETERMINED when the language is unknown', () => {
    expect(() => renderHook(() => useI18nPath(routing, 'routes/index.tsx'), { wrapper: routerAt('/api/health') })).toThrow(
      expect.objectContaining({ name: I18nRoutingError.name, code: 'LANGUAGE_NOT_DETERMINED' }),
    );
  });
});
