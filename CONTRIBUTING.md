# Contributing

## Development

Requires Node.js 24 (see `.node-version`) and pnpm (see `packageManager` in `package.json`).

```text
src/
  index.ts                  # "." entry point
  types.ts                  # route definition types and type-level helpers
  define-i18n-routes.ts     # defineI18nRoutes()
  create-i18n-routing.ts    # createI18nRouting() and I18nRouting
  negotiate-language.ts     # negotiateLanguage()
  guards.ts, route-id.ts, errors.ts
  react/                    # "./react" entry point: one module per hook or component
  route-config/             # "./route-config" entry point
tests/                      # mirrors src/
```

```sh
pnpm install
pnpm run format:check   # oxfmt
pnpm run lint:check     # oxlint (type-aware)
pnpm run typecheck      # tsc, including compile-time type tests
pnpm test               # vitest
pnpm run build          # tsdown; also runs publint and arethetypeswrong
```

CI runs all of these on every pull request.

## Commit messages

Commits to `main` must follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`,
…). release-please reads them to choose the next version and write `CHANGELOG.md`.

## Releases

Releases are managed by [release-please](https://github.com/googleapis/release-please). It maintains a release pull
request that bumps the version and updates `CHANGELOG.md`. Merging that pull request tags the release (`vX.Y.Z`),
creates a GitHub release, and publishes the package to npmjs.org. The first release is `v1.0.0`.

Publishing uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers). The `publish` job in
`.github/workflows/release-please.yaml` authenticates with GitHub's OIDC token, so no npm token is stored in the
repository, and npm attaches a provenance attestation to each version. The package's trusted publisher on npmjs.com must
name the `STN-DTS/react-router-i18n-routes` repository and the `release-please.yaml` workflow. The job skips a version
that is already on npmjs.org, so a failed run can be re-run safely.

### Repository setup

- Enable **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests**, or release-please
  cannot open the release pull request.
- Pull requests opened with the default `GITHUB_TOKEN` wait for a maintainer to select **Approve workflows to run**
  before CI runs on them. To run CI automatically on release pull requests, pass a GitHub App or fine-grained personal
  access token to the release-please action's `token` input.
