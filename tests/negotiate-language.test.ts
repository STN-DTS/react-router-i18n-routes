import { describe, expect, it } from 'vitest';

import { negotiateLanguage } from '../src/index';

describe('negotiateLanguage', () => {
  it.each([
    ['fr-CA,fr;q=0.9,en;q=0.8', 'fr'],
    ['en-US,en;q=0.9', 'en'],
    ['de,fr;q=0.5,en;q=0.7', 'en'],
    ['FR', 'fr'],
    ['de;q=1, fr ; q = 0.4', 'fr'],
    ['en;q=0.5,fr;q=0.5', 'en'],
    ['fr;q=0.5,en;q=0.5', 'fr'],
  ])('negotiateLanguage(%j) is %s', (header, expected) => {
    expect(negotiateLanguage(header, ['en', 'fr'])).toBe(expected);
  });

  it.each([
    [null, 'no header'],
    [undefined, 'no header'],
    ['', 'an empty header'],
    ['de, es', 'no supported language'],
    ['*', 'only a wildcard'],
    ['fr;q=0, de', 'only unacceptable supported languages'],
    ['fr;q=2, fr;q=abc, fr;q=-1', 'only malformed quality values'],
  ])('returns undefined for %j (%s)', (header, _reason) => {
    expect(negotiateLanguage(header, ['en', 'fr'])).toBeUndefined();
  });

  it('prefers an exact match over a primary subtag match', () => {
    expect(negotiateLanguage('fr-CA', ['fr', 'fr-CA'])).toBe('fr-CA');
    expect(negotiateLanguage('fr-CA', ['fr-FR', 'fr'])).toBe('fr-FR');
  });

  it('matches a less specific preference to a regional language', () => {
    expect(negotiateLanguage('fr', ['en-CA', 'fr-CA'])).toBe('fr-CA');
  });

  it('returns the supported language with its declared casing', () => {
    expect(negotiateLanguage('fr-ca', ['en-CA', 'fr-CA'])).toBe('fr-CA');
  });
});
