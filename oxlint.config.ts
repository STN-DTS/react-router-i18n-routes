import { defineConfig } from 'oxlint';

export default defineConfig({
  options: {
    reportUnusedDisableDirectives: 'error',
    typeAware: true,
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  categories: {
    correctness: 'error',
    suspicious: 'error',
  },
  plugins: ['typescript', 'import', 'react', 'vitest'],
  ignorePatterns: ['dist/**', 'coverage/**'],
  rules: {
    'curly': 'error',
    'eqeqeq': 'error',
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'react/react-in-jsx-scope': 'off',
    'react/rules-of-hooks': 'error',
    'typescript/consistent-type-exports': 'error',
    'typescript/consistent-type-imports': 'error',
    'typescript/no-explicit-any': 'error',
    'vitest/expect-expect': ['error', { assertFunctionNames: ['expect', 'expectTypeOf'] }],
  },
});
