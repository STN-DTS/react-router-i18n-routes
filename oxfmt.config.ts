import { defineConfig } from 'oxfmt';

export default defineConfig({
  printWidth: 128,
  quoteProps: 'consistent',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  sortImports: {
    customGroups: [
      { groupName: 'react', elementNamePattern: ['react', 'react-dom', 'react-dom/**'] },
      { groupName: 'testing-library', elementNamePattern: ['@testing-library/**'] },
      { groupName: 'react-router', elementNamePattern: ['react-router', 'react-router/**', '@react-router/**'] },
    ],
    groups: [
      'react',
      'testing-library',
      'react-router',
      'type-import',
      ['builtin', 'external'],
      'internal',
      ['parent', 'sibling', 'index'],
      'unknown',
    ],
  },
  sortPackageJson: false,
  ignorePatterns: ['CHANGELOG.md', 'pnpm-lock.yaml', '.release-please-manifest.json'],
});
