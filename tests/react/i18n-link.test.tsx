// @vitest-environment jsdom
import type { JSX } from 'react';
import { createRef } from 'react';

import { cleanup, render, screen } from '@testing-library/react';

import { MemoryRouter, Route, Routes } from 'react-router';

import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';

import { createI18nRouting } from '../../src/index';
import type { I18nLinkProps } from '../../src/react/index';
import { I18nLink } from '../../src/react/index';
import type { i18nRoutes } from '../fixtures';
import { routerAt, routing } from './helpers';

afterEach(() => {
  cleanup();
});

describe('I18nLink', () => {
  it('links to the route in the current language and forwards Link props', () => {
    render(
      <I18nLink routing={routing} file="routes/protected/dashboard.tsx" className="nav" lang="fr">
        Tableau de bord
      </I18nLink>,
      { wrapper: routerAt('/fr/') },
    );

    const link = screen.getByRole('link', { name: 'Tableau de bord' });
    expect(link.getAttribute('href')).toBe('/fr/tableau-de-bord');
    expect(link.getAttribute('class')).toBe('nav');
    expect(link.getAttribute('lang')).toBe('fr');
  });

  it('links to another language with params, search, and hash', () => {
    render(
      <I18nLink
        routing={routing}
        file="routes/protected/case/transaction.tsx"
        language="en"
        params={{ caseId: '1', transactionId: '2' }}
        search={new URLSearchParams({ a: '1' })}
        hash="#h"
        reloadDocument
      >
        English
      </I18nLink>,
      { wrapper: routerAt('/fr/dossier/1/transactions/2') },
    );

    expect(screen.getByRole('link', { name: 'English' }).getAttribute('href')).toBe('/en/case/1/transactions/2?a=1#h');
  });

  it('forwards refs to the anchor element', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <I18nLink ref={ref} routing={routing} file="routes/protected/dashboard.tsx">
        Dashboard
      </I18nLink>,
      { wrapper: routerAt('/en/') },
    );

    expect(ref.current).toBe(screen.getByRole('link', { name: 'Dashboard' }));
  });

  it('accepts refs through app-specific wrappers', () => {
    function AppLink(props: Omit<I18nLinkProps<typeof i18nRoutes>, 'routing'>) {
      return <I18nLink routing={routing} {...props} />;
    }

    const ref = createRef<HTMLAnchorElement>();
    render(
      <AppLink ref={ref} file="routes/index.tsx">
        Home
      </AppLink>,
      { wrapper: routerAt('/fr/tableau-de-bord') },
    );

    expect(ref.current?.getAttribute('href')).toBe('/fr');
  });

  it('links to paths declared without a leading slash from the app root (not the current URL)', () => {
    const relative = createI18nRouting([
      { id: 'DASH', file: 'dashboard.tsx', paths: { en: 'en/dashboard', fr: 'fr/tableau-de-bord' } },
    ]);

    // Relative `to` values resolve against the matched route, so render the link inside one.
    render(
      <MemoryRouter initialEntries={['/portal/fr/tableau-de-bord']} basename="/portal">
        <Routes>
          <Route
            path="/fr/tableau-de-bord"
            element={
              <I18nLink routing={relative} file="dashboard.tsx" language="en">
                English
              </I18nLink>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'English' }).getAttribute('href')).toBe('/portal/en/dashboard');
  });

  it('rejects unknown files and languages at compile time', () => {
    expectTypeOf(<I18nLink routing={routing} file="routes/index.tsx" language="fr" />).toEqualTypeOf<JSX.Element>();
    // @ts-expect-error -- unknown file
    void (<I18nLink routing={routing} file="routes/unknown.tsx" />);
    // @ts-expect-error -- unknown language
    void (<I18nLink routing={routing} file="routes/index.tsx" language="de" />);
    // @ts-expect-error -- `to` is replaced by `file`
    void (<I18nLink routing={routing} file="routes/index.tsx" to="/en/" />);
  });
});
