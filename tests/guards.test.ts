import { describe, expect, it } from 'vitest';

import { isI18nLayoutRoute, isI18nPageRoute } from '../src/index';

describe('isI18nLayoutRoute', () => {
  it.each([
    [{ file: 'layout.tsx', children: [] }, true],
    [{ id: 'A', file: 'a.tsx', paths: { en: '/en/a' } }, false],
    [null, false],
    ['layout.tsx', false],
  ])('isI18nLayoutRoute(%j) is %s', (value, expected) => {
    expect(isI18nLayoutRoute(value)).toBe(expected);
  });
});

describe('isI18nPageRoute', () => {
  it.each([
    [{ id: 'A', file: 'a.tsx', paths: { en: '/en/a' } }, true],
    [{ file: 'layout.tsx', children: [] }, false],
    [undefined, false],
    [42, false],
  ])('isI18nPageRoute(%j) is %s', (value, expected) => {
    expect(isI18nPageRoute(value)).toBe(expected);
  });
});
