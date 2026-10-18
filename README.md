# @dts-stn/react-router-i18n-routes

[![npm version](https://img.shields.io/npm/v/@dts-stn/react-router-i18n-routes)](https://www.npmjs.com/package/@dts-stn/react-router-i18n-routes)
[![CI](https://github.com/STN-DTS/react-router-i18n-routes/actions/workflows/ci.yaml/badge.svg)](https://github.com/STN-DTS/react-router-i18n-routes/actions/workflows/ci.yaml)
[![types: TypeScript](https://img.shields.io/badge/types-TypeScript-3178c6)](https://www.typescriptlang.org/)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue)](https://github.com/STN-DTS/react-router-i18n-routes/blob/main/LICENSE)

**Type-safe, translated URLs for [React Router](https://reactrouter.com/) framework mode.**

Declare every page once, with a path for each language. You get the React Router route config, localized links and
redirects, language detection, and a language switcher. Every route file and language is a string literal type, so a
broken link is a compile error, not a 404.

```ts
const i18nRoutes = defineI18nRoutes([
  {
    id: 'CASE-0001',
    file: 'routes/case.tsx',
    paths: { en: '/en/case/:caseId', fr: '/fr/dossier/:caseId' },
  },
]);

const i18nRouting = createI18nRouting(i18nRoutes);

i18nRouting.getPath('routes/case.tsx', 'fr', { params: { caseId: '42' } }); // '/fr/dossier/42'
i18nRouting.translatePath('/en/case/42', 'fr'); // '/fr/dossier/42'
i18nRouting.getPath('routes/case.tsx', 'de'); // ❌ type error: 'de' is not a supported language
i18nRouting.getPath('routes/cases.tsx', 'en'); // ❌ type error: no such route file
```

## Why?

A `/:lang/...` prefix is enough when only the language segment changes. Many sites, including government sites bound by
official-languages rules, need **fully translated paths** instead: `/en/dashboard` and `/fr/tableau-de-bord`. Doing
that by hand means registering every page once per language, keeping the paths in sync, and repeating the mapping in
every link, redirect, and language toggle. This package keeps one table of routes and builds everything else from it.

## Features

- 🗺️ **One source of truth.** Each page is declared once, and React Router gets one route per language.
- 🔒 **Fully typed, no `as const`.** Route files, ids, and languages are inferred as literal unions. Unknown files,
  layout files, and unsupported languages are rejected at compile time.
- 🔗 **Links and redirects.** `<I18nLink>` replaces `<Link>`, and `redirect()` builds `Response`s for loaders and
  actions, with params, search, and hash.
- 🌐 **Language switching.** `<I18nLanguageSwitchLink>` links to the current page in another language and keeps its
  params, search, and hash.
- 🧭 **URL matching.** URLs map back to routes and languages using React Router's own ranking, so static segments always
  beat dynamic ones.
- 🗣️ **Language negotiation.** The language comes from the URL, with an optional `Accept-Language` fallback.
- ✅ **Fail-fast validation.** Duplicate ids or files, missing translations, and route id collisions throw at startup.
- 🪶 **Small and tree-shakeable.** ESM-only, `sideEffects: false`, no runtime dependencies beyond its peers, and it works
  with React 18 and 19 and React Router 7 and 8.

## Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Concepts](#concepts)
- [Recipes](#recipes)
- [API reference](#api-reference)
- [Behavior details](#behavior-details)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

## Installation

```sh
npm install @dts-stn/react-router-i18n-routes
# or
pnpm add @dts-stn/react-router-i18n-routes
# or
yarn add @dts-stn/react-router-i18n-routes
```

### Requirements

| Package             | Version              | Needed for                                                                                       |
| ------------------- | -------------------- | ------------------------------------------------------------------------------------------------ |
| `react-router`      | `^7.0.0 \|\| ^8.0.0` | everything                                                                                       |
| `react`             | `>=18.0.0`           | [`@dts-stn/react-router-i18n-routes/react`](#dts-stnreact-router-i18n-routesreact)               |
| `@react-router/dev` | `^7.0.0 \|\| ^8.0.0` | [`@dts-stn/react-router-i18n-routes/route-config`](#dts-stnreact-router-i18n-routesroute-config) |

`react` and `@react-router/dev` are optional peers. Install them only if you use the entry point that needs them.

The package is **ESM-only** and requires Node.js 20 or later. Type inference relies on
[`const` type parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters),
so TypeScript 5.0 or later is required.

### Entry points

| Import path                                      | Contents                                                    | Use from                     |
| ------------------------------------------------ | ----------------------------------------------------------- | ---------------------------- |
| `@dts-stn/react-router-i18n-routes`              | Route definitions, `createI18nRouting()`, types, and errors | anywhere (client and server) |
| `@dts-stn/react-router-i18n-routes/react`        | Hooks and link components                                   | React components             |
| `@dts-stn/react-router-i18n-routes/route-config` | Conversion to React Router route config                     | `app/routes.ts`              |

## Quick start

### 1. Define the routes

Keep the definitions in their own module so `app/routes.ts`, components, loaders, and actions can all import them.

```ts
// app/i18n-routes.ts
import type { I18nLanguageOf, I18nRouteFileOf } from '@dts-stn/react-router-i18n-routes';
import { createI18nRouting, defineI18nRoutes } from '@dts-stn/react-router-i18n-routes';

export const i18nRoutes = defineI18nRoutes([
  {
    id: 'HOME-0001',
    file: 'routes/index.tsx',
    paths: { en: '/en/', fr: '/fr/' },
  },
  {
    // A pathless layout route
    file: 'routes/protected/layout.tsx',
    children: [
      {
        id: 'DASH-0001',
        file: 'routes/protected/dashboard.tsx',
        paths: { en: '/en/dashboard', fr: '/fr/tableau-de-bord' },
      },
      {
        id: 'CASE-0001',
        file: 'routes/protected/case.tsx',
        paths: { en: '/en/case/:caseId', fr: '/fr/dossier/:caseId' },
      },
    ],
  },
]);

export const i18nRouting = createI18nRouting(i18nRoutes);

export type I18nRouteFile = I18nRouteFileOf<typeof i18nRoutes>;
// 'routes/index.tsx' | 'routes/protected/dashboard.tsx' | 'routes/protected/case.tsx'

export type Language = I18nLanguageOf<typeof i18nRoutes>;
// 'en' | 'fr'
```

### 2. Register the routes with React Router

```ts
// app/routes.ts
import type { RouteConfig } from '@react-router/dev/routes';
import { route } from '@react-router/dev/routes';

import { toRouteConfigEntries } from '@dts-stn/react-router-i18n-routes/route-config';

import { i18nRoutes } from './i18n-routes';

export default [
  route('/api/health', 'routes/api/health.ts'), // non-translated routes work as usual
  ...toRouteConfigEntries(i18nRoutes),
] satisfies RouteConfig;
```

> [!IMPORTANT]
> React Router's config loader does not resolve path aliases such as `~/`, so import the definitions into
> `app/routes.ts` with a relative path.

### 3. Link, redirect, and switch languages

```tsx
import {
  I18nLanguageSwitchLink,
  I18nLink,
  useIsCurrentRoute,
  useIsNavigatingTo,
  useLanguage,
} from '@dts-stn/react-router-i18n-routes/react';

import { i18nRouting } from '~/i18n-routes';

export function Navigation() {
  const { alternateLanguage } = useLanguage(i18nRouting);
  const isDashboard = useIsCurrentRoute(i18nRouting, 'routes/protected/dashboard.tsx');
  const isLoadingCase = useIsNavigatingTo(i18nRouting, 'routes/protected/case.tsx', { params: { caseId: '42' } });

  return (
    <nav>
      {/* Links to the current language by default */}
      <I18nLink routing={i18nRouting} file="routes/protected/dashboard.tsx" aria-current={isDashboard ? 'page' : undefined}>
        Dashboard
      </I18nLink>

      {/* Any React Router <Link> prop is forwarded */}
      <I18nLink
        routing={i18nRouting}
        file="routes/protected/case.tsx"
        params={{ caseId: '42' }}
        search="tab=notes"
        prefetch="intent"
      >
        Case 42 {isLoadingCase && '…'}
      </I18nLink>

      {/* The current page in the other language, with the same params, search, and hash */}
      <I18nLanguageSwitchLink routing={i18nRouting}>
        {alternateLanguage === 'fr' ? 'Français' : 'English'}
      </I18nLanguageSwitchLink>
    </nav>
  );
}
```

```ts
// app/routes/protected/layout.tsx
import { i18nRouting } from '~/i18n-routes';

import type { Route } from './+types/layout';

export function loader({ request }: Route.LoaderArgs) {
  if (!isSignedIn(request)) {
    const language = i18nRouting.getLanguage(request) ?? 'en';
    throw i18nRouting.redirect('routes/index.tsx', language);
  }
}
```

That's it. Every `file`, `language`, and `params` value above is type-checked against `app/i18n-routes.ts`.

## Concepts

### Page routes

A page route has an `id`, a route module `file`, and a path for each language:

```ts
{ id: 'DASH-0001', file: 'routes/protected/dashboard.tsx', paths: { en: '/en/dashboard', fr: '/fr/tableau-de-bord' } }
```

- **`file`** is the route module, relative to the app directory, as in `app/routes.ts`. It is also the **lookup key**:
  links, redirects, and hooks refer to a page by its file.
- **`paths`** uses React Router path syntax: dynamic segments (`:caseId`), optional segments (`:tab?`), and splats
  (`*`) all work. Every page route must declare the **same set of languages**.
- **`id`** must be unique. React Router gets one route per language, with the id `${id}-${LANGUAGE}` (`DASH-0001-EN`,
  `DASH-0001-FR`). Pass these ids to `useRouteLoaderData()`, or build them with [`getI18nRouteId()`](#geti18nrouteidid-language).

### Layout routes

A layout route has a `file` and `children` but no `id` or `paths`. It becomes a pathless React Router `layout()` route
that renders its children through `<Outlet />`, which is useful for authentication guards, shared chrome, and shared
loaders. Layouts can be nested. A layout cannot be a link target, so passing a layout file to `getPath()` is a type
error.

### The routing instance

`createI18nRouting(i18nRoutes)` validates the definitions once and returns an
[`I18nRouting`](#i18nrouting) object with every lookup and URL builder. Create it once at module level and import it
wherever it is needed. The React hooks and components take it as their first argument or `routing` prop.

## Recipes

### Set `<html lang>` in the root layout

```tsx
// app/root.tsx
import type { ReactNode } from 'react';

import { Links, Meta, Scripts, ScrollRestoration } from 'react-router';

import { useCurrentLanguage } from '@dts-stn/react-router-i18n-routes/react';

import { i18nRouting } from '~/i18n-routes';

export function Layout({ children }: { children: ReactNode }) {
  const language = useCurrentLanguage(i18nRouting) ?? 'en';

  return (
    <html lang={language}>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

### Redirect `/` to the visitor's preferred language

Register a plain index route next to the i18n routes, and negotiate the language from the `Accept-Language` header:

```ts
// app/routes.ts
export default [index('routes/language-redirect.ts'), ...toRouteConfigEntries(i18nRoutes)] satisfies RouteConfig;
```

```ts
// app/routes/language-redirect.ts
import { i18nRouting } from '~/i18n-routes';

import type { Route } from './+types/language-redirect';

export function loader({ request }: Route.LoaderArgs) {
  // The language of the URL path, then the Accept-Language header, then English
  const language = i18nRouting.getLanguage(request, { acceptLanguage: true }) ?? 'en';
  return i18nRouting.redirect('routes/index.tsx', language);
}
```

### Show a 404 page in the right language

`getLanguage()` falls back to the first path segment when no page route matches, so a catch-all route still knows that
`/fr/page-inexistante` is French:

```ts
// app/routes.ts
export default [...toRouteConfigEntries(i18nRoutes), route('*', 'routes/not-found.tsx')] satisfies RouteConfig;
```

```tsx
// app/routes/not-found.tsx
export default function NotFound() {
  const language = useCurrentLanguage(i18nRouting) ?? 'en';
  return <h1>{language === 'fr' ? 'Page introuvable' : 'Page not found'}</h1>;
}
```

### Add `hreflang` alternate links for SEO

```tsx
import { useLocation } from 'react-router';

import { i18nRouting } from '~/i18n-routes';

const ORIGIN = 'https://www.example.com';

export function AlternateLinks() {
  const { pathname } = useLocation();

  return i18nRouting.languages.map((language) => {
    const path = i18nRouting.translatePath(pathname, language);
    return path && <link key={language} rel="alternate" hrefLang={language} href={new URL(path, ORIGIN).href} />;
  });
}
```

Render `<AlternateLinks />` inside `<head>` in `app/root.tsx`.

### Support three or more languages

`alternateLanguage` is set only for bilingual apps. With more languages, list `alternateLanguages` and pass each one to
`I18nLanguageSwitchLink`:

```tsx
const LANGUAGE_NAMES = { en: 'English', fr: 'Français', es: 'Español' } as const;

export function LanguageMenu() {
  const { alternateLanguages } = useLanguage(i18nRouting);

  return (
    <ul>
      {alternateLanguages.map((language) => (
        <li key={language}>
          <I18nLanguageSwitchLink routing={i18nRouting} language={language}>
            {LANGUAGE_NAMES[language]}
          </I18nLanguageSwitchLink>
        </li>
      ))}
    </ul>
  );
}
```

`I18nLanguageSwitchLink` sets `lang` and `hrefLang` on the `<a>`, so screen readers pronounce each language name
correctly.

### Reload the document when switching languages

If translations are loaded once per document (for example, an i18next instance created on the server), pass
`reloadDocument` so that switching languages does a full page load:

```tsx
<I18nLanguageSwitchLink routing={i18nRouting} reloadDocument>
  Français
</I18nLanguageSwitchLink>
```

### Build an app-specific link component

Bind `routing` and your default styles once:

```tsx
import type { I18nLinkProps } from '@dts-stn/react-router-i18n-routes/react';
import { I18nLink } from '@dts-stn/react-router-i18n-routes/react';

import type { i18nRoutes } from '~/i18n-routes';
import { i18nRouting } from '~/i18n-routes';

export function AppLink(props: Omit<I18nLinkProps<typeof i18nRoutes>, 'routing'>) {
  return <I18nLink routing={i18nRouting} className="underline" {...props} />;
}
```

```tsx
<AppLink file="routes/protected/dashboard.tsx">Dashboard</AppLink> // ✅
<AppLink file="routes/protected/dashbord.tsx">Dashboard</AppLink> // ❌ type error
```

For non-link navigation (`navigate()`, `<Form action>`, `fetcher.submit()`), use
[`useI18nPath()`](#usei18npathrouting-file-options) to build the path.

### Handle routing errors

Every error thrown by the package is an `I18nRoutingError` with a machine-readable `code`:

```ts
import { I18nRoutingError } from '@dts-stn/react-router-i18n-routes';

try {
  const { route, language, params } = i18nRouting.getRouteByPath(pathname);
} catch (error) {
  if (error instanceof I18nRoutingError && error.code === 'ROUTE_NOT_FOUND') {
    // ...
  }
  throw error;
}
```

The `find*` methods return `undefined` instead of throwing, which is often simpler.

## API reference

### `@dts-stn/react-router-i18n-routes`

#### `defineI18nRoutes(routes)`

Returns `routes` unchanged, typed as literals, with no `as const` needed. Use it to declare the route table.

#### `createI18nRouting(routes)`

Validates the routes and returns an [`I18nRouting`](#i18nrouting) instance. Throws `I18nRoutingError` with code
`INVALID_ROUTES` if:

- two page routes share an `id` or a `file`,
- the page routes do not all declare the same languages, or
- two route/language pairs generate the same React Router route id. For example, languages `en` and `EN` collide, and so
  do route `PAGE` with language `fr-CA` and route `PAGE-FR` with language `ca`, which both generate `PAGE-FR-CA`.

#### `I18nRouting`

| Member                                        | Returns                                    | Description                                                                                                                             |
| --------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `routes`                                      | `T`                                        | The route definitions.                                                                                                                  |
| `languages`                                   | `Language[]`                               | The supported languages, in declaration order.                                                                                          |
| `getPath(file, language, options?)`           | `string`                                   | The localized, root-relative path. `options`: `params`, `search` (`string` or `URLSearchParams`), `hash`.                               |
| `redirect(file, language, options?)`          | `Response`                                 | A redirect to `getPath()`. `options.init` sets the status (default `302`) or a full `ResponseInit`.                                     |
| `translatePath(pathname, language, options?)` | `string \| undefined`                      | The matching page route's path in another language, keeping its params (`/en/case/42` → `/fr/dossier/42`). `options`: `search`, `hash`. |
| `getLanguage(resource, options?)`             | `Language \| undefined`                    | The language of a pathname, `URL`, or `Request`. See [language detection](#language-detection).                                         |
| `getAlternateLanguages(language)`             | `Language[]`                               | The other supported languages, in declaration order.                                                                                    |
| `findRouteByPath(pathname)`                   | `{ route, language, params } \| undefined` | Matches a pathname to a page route and language.                                                                                        |
| `getRouteByPath(pathname)`                    | `{ route, language, params }`              | Same as `findRouteByPath()`, but throws `ROUTE_NOT_FOUND`.                                                                              |
| `findRouteByFile(file)`                       | `PageRoute \| undefined`                   | The page route for a file. Accepts any string, so you can test unknown values.                                                          |
| `getRouteByFile(file)`                        | `PageRoute`                                | The page route for a known file, typed as that exact route. Throws `ROUTE_NOT_FOUND`.                                                   |

#### `getI18nRouteId(id, language)`

The React Router route id for one language of a page route: `getI18nRouteId('DASH-0001', 'fr')` → `'DASH-0001-FR'`.

#### `negotiateLanguage(acceptLanguage, languages)`

The best supported language for an `Accept-Language` header value, or `undefined`. See
[language detection](#language-detection).

```ts
negotiateLanguage('fr-CA,fr;q=0.9,en;q=0.8', ['en', 'fr']); // 'fr'
```

#### `isI18nPageRoute(value)`, `isI18nLayoutRoute(value)`

Type guards for walking route definitions.

#### `I18nRoutingError`

The error thrown by the package. Its `code` is one of:

| Code                      | Thrown when                                                                    |
| ------------------------- | ------------------------------------------------------------------------------ |
| `INVALID_ROUTES`          | `createI18nRouting()` finds inconsistent definitions.                          |
| `ROUTE_NOT_FOUND`         | No page route matches the file or pathname passed to a `get*` method.          |
| `LANGUAGE_NOT_DETERMINED` | `useI18nPath()` or `I18nLink` gets no `language` and the current URL has none. |

#### Types

| Type                                                                                        | Description                                                          |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `I18nRoute<L>`, `I18nPageRoute<L>`, `I18nLayoutRoute<L>`                                    | Route definition types, generic over the language union `L`.         |
| `I18nPaths<L>`                                                                              | `{ [language]: path }`.                                              |
| `I18nRouteFileOf<T>`                                                                        | The union of page route files in `typeof routes`.                    |
| `I18nRouteIdOf<T>`                                                                          | The union of page route ids.                                         |
| `I18nLanguageOf<T>`                                                                         | The union of languages declared by _every_ page route.               |
| `I18nPageRouteOf<T>`                                                                        | The union of page route definitions.                                 |
| `I18nPageRouteForFile<T, F>`                                                                | The page route for file `F` (the return type of `getRouteByFile()`). |
| `I18nRouting<T>`, `I18nRouteMatch<T>`                                                       | The routing instance and the result of `findRouteByPath()`.          |
| `I18nPathOptions`, `I18nRedirectOptions`, `I18nTranslatePathOptions`, `I18nLanguageOptions` | Option types for the `I18nRouting` methods.                          |
| `I18nRoutingErrorCode`                                                                      | The union of error codes.                                            |

The type helpers also accept wide types such as `I18nRoute<'en' | 'fr'>[]`. For those, files and ids resolve to `string`
and languages to the declared union.

### `@dts-stn/react-router-i18n-routes/react`

Every hook and component takes the routing instance as its first argument (hooks) or `routing` prop (components). All of
them read the current location from React Router, so they must render inside a router.

#### `useLanguage(routing)`

Returns `{ currentLanguage, alternateLanguage, alternateLanguages }` for the current location. `alternateLanguage` is set
only when there is exactly one other language, which is the bilingual case.

#### `useCurrentLanguage(routing)`

The language of the current location, or `undefined` (`routing.getLanguage(pathname)`).

#### `useI18nRouteMatch(routing)`

`{ route, language, params }` for the current location, or `undefined` (`routing.findRouteByPath(pathname)`).

#### `useI18nPath(routing, file, options?)`

`routing.getPath()`, with `options.language` defaulting to the current language. Throws `LANGUAGE_NOT_DETERMINED` if
neither is available. Use it for `navigate()`, `<Form action>`, and anything else that needs a path rather than a link.

#### `useLanguageSwitchPath(routing, language?)`

The current page in `language` (default: the alternate language), keeping its params, search, and hash. Returns
`undefined` outside the i18n routes.

#### `useIsCurrentRoute(routing, file, options?)`

Whether the current location is `file`'s page route, in any language. With `options.params`, the matched route's params
must also be equal. Use it for `aria-current="page"`.

#### `useIsNavigatingTo(routing, file, options?)`

Whether a navigation to `file`'s page route is loading. `options.language` defaults to the current language, and
`options.params` also compares the matched route's params. Use it for pending indicators. Requires a data router
(framework mode, `createBrowserRouter()`, or `createMemoryRouter()`).

For both `useIsCurrentRoute()` and `useIsNavigatingTo()`:

- `file` may be `undefined` (the result is then `false`), so you can call them unconditionally from components whose
  links are not always i18n routes.
- `options.params` compares only the matched route's own params, so you can pass the full `useParams()` object.

#### `<I18nLink>`

A React Router `<Link>` whose `to` prop is replaced by `routing`, `file`, and the optional `language`, `params`,
`search`, and `hash`. The language defaults to the current language. Every other `<Link>` prop, including `ref`,
`prefetch`, and `viewTransition`, is forwarded.

#### `<I18nLanguageSwitchLink>`

An unstyled React Router `<Link>` to [`useLanguageSwitchPath()`](#uselanguageswitchpathrouting-language), with `lang`
and `hrefLang` set to the target language. Its `to` prop is replaced by `routing` and an optional `language`. Every other
prop, including `ref` and `reloadDocument`, is forwarded. It renders nothing outside the i18n routes.

### `@dts-stn/react-router-i18n-routes/route-config`

| Export                                | Description                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| `toRouteConfigEntries(routes)`        | Converts route definitions into React Router route config entries, recursively.       |
| `toPageRouteConfigEntries(pageRoute)` | Converts one page route into one entry per language, to register it outside the tree. |

This entry point depends only on `@react-router/dev/routes`, so it is safe to import from `app/routes.ts`.

## Behavior details

### Path matching

`findRouteByPath()`, `translatePath()`, `getLanguage()`, and the hooks match pathnames with React Router's
`matchRoutes()` across every page route and language. As a result:

- static segments win over dynamic segments, and dynamic segments win over splats, regardless of declaration order,
- trailing slashes are ignored,
- percent-encoded pathnames are decoded, and
- pathnames are relative to the app's `basename`.

### Path generation

`getPath()` uses React Router's `generatePath()`. As a result:

- a missing required param throws,
- trailing slashes are removed (`/en/` → `/en`),
- the result always starts with `/`, even when a path is declared without one (`en/about` → `/en/about`), so links
  never resolve relative to the current URL, and
- static segments, search, and hash are returned as declared (`/fr/à-propos`).

`redirect()` percent-encodes non-ASCII characters for the `Location` header (`/fr/%C3%A0-propos`) and leaves existing
percent-escapes unchanged.

### Language detection

`getLanguage(resource)` tries, in order:

1. the language of the matching page route,
2. the first path segment, if it is a supported language (`/fr/anything` → `fr`), and
3. only with `{ acceptLanguage: true }` and a `Request`, the `Accept-Language` header, using `negotiateLanguage()`.

`negotiateLanguage()` tries preferences in descending quality order, and ties keep header order. An exact,
case-insensitive match wins. Otherwise primary subtags are compared, so `fr-CA` matches `fr` and `fr` matches `fr-CA`.
Entries with `q=0`, the `*` wildcard, and malformed entries are ignored.

Cookies, sessions, and user preferences are deliberately left to the application. Read them first, then fall back to
`getLanguage()`.

## FAQ

**Does it translate my content?**
No. It handles URLs only. Pair it with any translation library (i18next, react-intl, Lingui, …) and pass it the language
from `useCurrentLanguage()` or `getLanguage()`.

**Can a page exist in only one language?**
Not as an i18n route: every page route must declare every language, which guarantees that the language switcher always
has a target. Register single-language pages with React Router's own `route()` in `app/routes.ts`.

**Can I use a `/:lang/...` style instead of translated paths?**
Yes. The paths are plain strings, so `{ en: '/en/about', fr: '/fr/about' }` works just as well as translated slugs.

**Does it work in declarative or data mode (without `app/routes.ts`)?**
The core entry point and the React hooks work with any router. `/route-config` is specific to framework mode, and
`useIsNavigatingTo()` needs a data router. In other modes, build your route objects from `i18nRoutes` with
`getI18nRouteId()`.

**Why do route ids look like `DASH-0001-EN`?**
React Router needs a unique id per route, and each page becomes one route per language. Use any id scheme you like; the
language suffix is appended in upper case.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](https://github.com/STN-DTS/react-router-i18n-routes/blob/main/CONTRIBUTING.md)
for the development setup and release process.

## License

[MIT](https://github.com/STN-DTS/react-router-i18n-routes/blob/main/LICENSE)
