import { defineI18nRoutes } from '../src/index';

export const i18nRoutes = defineI18nRoutes([
  {
    id: 'HOME-0001',
    file: 'routes/index.tsx',
    paths: { en: '/en/', fr: '/fr/' },
  },
  {
    file: 'routes/protected/layout.tsx',
    children: [
      {
        id: 'DASH-0001',
        file: 'routes/protected/dashboard.tsx',
        paths: { en: '/en/dashboard', fr: '/fr/tableau-de-bord' },
      },
      {
        file: 'routes/protected/case/layout.tsx',
        children: [
          {
            id: 'CASE-0001',
            file: 'routes/protected/case/transaction.tsx',
            paths: {
              en: '/en/case/:caseId/transactions/:transactionId',
              fr: '/fr/dossier/:caseId/transactions/:transactionId',
            },
          },
          // Declared after the dynamic route above to prove that static segments win regardless of order.
          {
            id: 'CASE-0002',
            file: 'routes/protected/case/new-transaction.tsx',
            paths: { en: '/en/case/:caseId/transactions/new', fr: '/fr/dossier/:caseId/transactions/nouvelle' },
          },
          {
            id: 'CASE-0003',
            file: 'routes/protected/case/a-propos.tsx',
            paths: { en: '/en/case/about', fr: '/fr/dossier/à-propos' },
          },
        ],
      },
    ],
  },
]);
