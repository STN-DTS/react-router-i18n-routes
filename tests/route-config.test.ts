import { describe, expect, it } from 'vitest';

import { toPageRouteConfigEntries, toRouteConfigEntries } from '../src/route-config/index';
import { i18nRoutes } from './fixtures';

describe('toPageRouteConfigEntries', () => {
  it('creates one route per language with a language-suffixed id', () => {
    expect(
      toPageRouteConfigEntries({
        id: 'SUPR-0001',
        file: 'routes/supervision.tsx',
        paths: { en: 'en/supervision', fr: 'fr/supervision' },
      }),
    ).toEqual([
      { id: 'SUPR-0001-EN', path: 'en/supervision', file: 'routes/supervision.tsx' },
      { id: 'SUPR-0001-FR', path: 'fr/supervision', file: 'routes/supervision.tsx' },
    ]);
  });
});

describe('toRouteConfigEntries', () => {
  it('converts layouts and page routes recursively', () => {
    expect(toRouteConfigEntries(i18nRoutes)).toEqual([
      { id: 'HOME-0001-EN', path: '/en/', file: 'routes/index.tsx' },
      { id: 'HOME-0001-FR', path: '/fr/', file: 'routes/index.tsx' },
      {
        file: 'routes/protected/layout.tsx',
        children: [
          { id: 'DASH-0001-EN', path: '/en/dashboard', file: 'routes/protected/dashboard.tsx' },
          { id: 'DASH-0001-FR', path: '/fr/tableau-de-bord', file: 'routes/protected/dashboard.tsx' },
          {
            file: 'routes/protected/case/layout.tsx',
            children: [
              {
                id: 'CASE-0001-EN',
                path: '/en/case/:caseId/transactions/:transactionId',
                file: 'routes/protected/case/transaction.tsx',
              },
              {
                id: 'CASE-0001-FR',
                path: '/fr/dossier/:caseId/transactions/:transactionId',
                file: 'routes/protected/case/transaction.tsx',
              },
              {
                id: 'CASE-0002-EN',
                path: '/en/case/:caseId/transactions/new',
                file: 'routes/protected/case/new-transaction.tsx',
              },
              {
                id: 'CASE-0002-FR',
                path: '/fr/dossier/:caseId/transactions/nouvelle',
                file: 'routes/protected/case/new-transaction.tsx',
              },
              { id: 'CASE-0003-EN', path: '/en/case/about', file: 'routes/protected/case/a-propos.tsx' },
              { id: 'CASE-0003-FR', path: '/fr/dossier/à-propos', file: 'routes/protected/case/a-propos.tsx' },
            ],
          },
        ],
      },
    ]);
  });
});
