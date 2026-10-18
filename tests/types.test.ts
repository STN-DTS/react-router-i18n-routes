import { describe, expectTypeOf, it } from 'vitest';

import type {
  I18nLanguageOf,
  I18nLayoutRoute,
  I18nPageRoute,
  I18nPageRouteForFile,
  I18nPageRouteOf,
  I18nRoute,
  I18nRouteFileOf,
  I18nRouteIdOf,
  I18nRouteMatch,
} from '../src/index';
import { createI18nRouting, defineI18nRoutes } from '../src/index';
import { i18nRoutes } from './fixtures';

type Routes = typeof i18nRoutes;

describe('type extraction', () => {
  it('extracts the page route files from nested layouts, without `as const`', () => {
    expectTypeOf<I18nRouteFileOf<Routes>>().toEqualTypeOf<
      | 'routes/index.tsx'
      | 'routes/protected/dashboard.tsx'
      | 'routes/protected/case/transaction.tsx'
      | 'routes/protected/case/new-transaction.tsx'
      | 'routes/protected/case/a-propos.tsx'
    >();
  });

  it('extracts the page route ids', () => {
    expectTypeOf<I18nRouteIdOf<Routes>>().toEqualTypeOf<'HOME-0001' | 'DASH-0001' | 'CASE-0001' | 'CASE-0002' | 'CASE-0003'>();
  });

  it('extracts the languages', () => {
    expectTypeOf<I18nLanguageOf<Routes>>().toEqualTypeOf<'en' | 'fr'>();
  });

  it('narrows the languages to those declared by every page route', () => {
    const routes = defineI18nRoutes([
      { id: 'A', file: 'a.tsx', paths: { en: '/en/a', fr: '/fr/a' } },
      { id: 'B', file: 'b.tsx', paths: { en: '/en/b' } },
    ]);

    expectTypeOf<I18nLanguageOf<typeof routes>>().toEqualTypeOf<'en'>();
  });

  it('falls back to wide types for non-literal routes', () => {
    expectTypeOf<I18nPageRouteOf<I18nRoute[]>>().toEqualTypeOf<I18nPageRoute>();
    expectTypeOf<I18nRouteFileOf<I18nRoute[]>>().toEqualTypeOf<string>();
    expectTypeOf<I18nLanguageOf<I18nRoute<'en' | 'fr'>[]>>().toEqualTypeOf<'en' | 'fr'>();
  });

  it('keeps the declared languages of wide layout routes', () => {
    expectTypeOf<I18nPageRouteOf<I18nLayoutRoute<'en' | 'fr'>[]>>().toEqualTypeOf<I18nPageRoute<'en' | 'fr'>>();
    expectTypeOf<I18nLanguageOf<I18nLayoutRoute<'en' | 'fr'>[]>>().toEqualTypeOf<'en' | 'fr'>();

    const routing = createI18nRouting<I18nLayoutRoute<'en' | 'fr'>[]>([]);
    expectTypeOf(routing.getPath).toBeCallableWith('any-file.tsx', 'fr');
    // @ts-expect-error -- unknown language
    expectTypeOf(routing.getPath).toBeCallableWith('any-file.tsx', 'de');
  });

  it('selects the page route for a file', () => {
    expectTypeOf<I18nPageRouteForFile<Routes, 'routes/index.tsx'>['id']>().toEqualTypeOf<'HOME-0001'>();
    expectTypeOf<I18nPageRouteForFile<Routes, 'routes/index.tsx' | 'routes/protected/dashboard.tsx'>['id']>().toEqualTypeOf<
      'HOME-0001' | 'DASH-0001'
    >();
    expectTypeOf<I18nPageRouteForFile<I18nRoute[], 'a.tsx'>>().toEqualTypeOf<I18nPageRoute>();
  });

  it('rejects invalid route definitions', () => {
    expectTypeOf(defineI18nRoutes).toBeCallableWith([{ id: 'A', file: 'a.tsx', paths: { en: '/en/a' } }]);
    // @ts-expect-error -- page routes need an id
    expectTypeOf(defineI18nRoutes).toBeCallableWith([{ file: 'a.tsx', paths: { en: '/en/a' } }]);
    // @ts-expect-error -- paths must be strings
    expectTypeOf(defineI18nRoutes).toBeCallableWith([{ id: 'A', file: 'a.tsx', paths: { en: 1 } }]);
    // @ts-expect-error -- layout routes need children
    expectTypeOf(defineI18nRoutes).toBeCallableWith([{ file: 'layout.tsx' }]);
  });
});

describe('createI18nRouting types', () => {
  const routing = createI18nRouting(i18nRoutes);

  it('types the routing instance from the routes', () => {
    expectTypeOf(routing.languages).toEqualTypeOf<readonly ('en' | 'fr')[]>();
    expectTypeOf(routing.getLanguage).returns.toEqualTypeOf<'en' | 'fr' | undefined>();
    expectTypeOf(routing.findRouteByPath).returns.toEqualTypeOf<I18nRouteMatch<Routes> | undefined>();
  });

  it('returns the exact route for a file', () => {
    const route = routing.getRouteByFile('routes/protected/dashboard.tsx');
    expectTypeOf(route.id).toEqualTypeOf<'DASH-0001'>();
    expectTypeOf(route.paths.fr).toEqualTypeOf<'/fr/tableau-de-bord'>();
  });

  it('rejects unknown files and languages', () => {
    // @ts-expect-error -- unknown file
    expectTypeOf(routing.getPath).toBeCallableWith('routes/unknown.tsx', 'en');
    // @ts-expect-error -- unknown language
    expectTypeOf(routing.getPath).toBeCallableWith('routes/index.tsx', 'de');
    // @ts-expect-error -- layout routes cannot be linked to
    expectTypeOf(routing.getPath).toBeCallableWith('routes/protected/layout.tsx', 'en');
    expectTypeOf(routing.getPath).toBeCallableWith('routes/index.tsx', 'fr');
  });

  it('returns the wide page route type for wide route tables', () => {
    const wideRoutes: I18nRoute[] = [{ id: 'A', file: 'a.tsx', paths: { en: '/en/a' } }];
    const wide = createI18nRouting(wideRoutes);

    expectTypeOf(wide.getRouteByFile('a.tsx')).toEqualTypeOf<I18nPageRoute>();
    expectTypeOf(wide.getRouteByFile('a.tsx').id).toEqualTypeOf<string>();
  });

  it('types the language helpers', () => {
    expectTypeOf(routing.getAlternateLanguages).returns.toEqualTypeOf<readonly ('en' | 'fr')[]>();
    expectTypeOf(routing.translatePath).returns.toEqualTypeOf<string | undefined>();
    expectTypeOf(routing.getLanguage).toBeCallableWith(new Request('https://example.com/'), { acceptLanguage: true });
    expectTypeOf(routing.translatePath).toBeCallableWith('/en/', 'fr', { search: 'a=1', hash: 'top' });
    // @ts-expect-error -- unknown language
    expectTypeOf(routing.translatePath).toBeCallableWith('/en/', 'de');
    // @ts-expect-error -- unknown language
    expectTypeOf(routing.getAlternateLanguages).toBeCallableWith('de');
  });

  it('infers literal types when routes are passed inline', () => {
    const inline = createI18nRouting([{ id: 'A', file: 'a.tsx', paths: { en: '/en/a', fr: '/fr/a' } }]);
    expectTypeOf<I18nRouteFileOf<typeof inline.routes>>().toEqualTypeOf<'a.tsx'>();
  });
});
