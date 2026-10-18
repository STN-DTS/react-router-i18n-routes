// @vitest-environment jsdom
import type { JSX } from 'react';
import { createRef } from 'react';

import { cleanup, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';

import { I18nLanguageSwitchLink } from '../../src/react/index';
import { routerAt, routing } from './helpers';

afterEach(() => {
  cleanup();
});

describe('I18nLanguageSwitchLink', () => {
  it('links to the current page in the alternate language, with lang and hrefLang', () => {
    render(
      <I18nLanguageSwitchLink routing={routing} className="switch">
        English
      </I18nLanguageSwitchLink>,
      { wrapper: routerAt('/fr/dossier/1/transactions/2?tab=notes') },
    );

    const link = screen.getByRole('link', { name: 'English' });
    expect(link.getAttribute('href')).toBe('/en/case/1/transactions/2?tab=notes');
    expect(link.getAttribute('lang')).toBe('en');
    expect(link.getAttribute('hreflang')).toBe('en');
    expect(link.getAttribute('class')).toBe('switch');
  });

  it('uses the requested language and lets props override lang', () => {
    render(
      <I18nLanguageSwitchLink routing={routing} language="fr" lang="fr-CA">
        Français
      </I18nLanguageSwitchLink>,
      { wrapper: routerAt('/en/dashboard') },
    );

    const link = screen.getByRole('link', { name: 'Français' });
    expect(link.getAttribute('href')).toBe('/fr/tableau-de-bord');
    expect(link.getAttribute('lang')).toBe('fr-CA');
  });

  it('forwards refs to the anchor element', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <I18nLanguageSwitchLink ref={ref} routing={routing}>
        Français
      </I18nLanguageSwitchLink>,
      { wrapper: routerAt('/en/dashboard') },
    );

    expect(ref.current).toBe(screen.getByRole('link', { name: 'Français' }));
  });

  it('renders nothing outside the i18n routes', () => {
    const { container } = render(<I18nLanguageSwitchLink routing={routing}>Français</I18nLanguageSwitchLink>, {
      wrapper: routerAt('/en/unknown'),
    });

    expect(container.innerHTML).toBe('');
  });

  it('only accepts supported languages', () => {
    expectTypeOf(<I18nLanguageSwitchLink routing={routing} language="fr" />).toEqualTypeOf<JSX.Element>();
    // @ts-expect-error -- unknown language
    void (<I18nLanguageSwitchLink routing={routing} language="de" />);
    // @ts-expect-error -- `to` is replaced by `language`
    void (<I18nLanguageSwitchLink routing={routing} to="/en/" />);
  });
});
