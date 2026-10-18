interface LanguagePreference {
  readonly tag: string;
  readonly quality: number;
}

/**
 * Selects the best supported language for an `Accept-Language` header value.
 *
 * Preferences are tried in descending quality order (ties keep header order). For each preference,
 * an exact (case-insensitive) match wins; otherwise the primary subtags are compared, so `fr-CA`
 * matches a supported `fr`, and `fr` matches a supported `fr-CA`. Entries with `q=0`, the `*`
 * wildcard, and malformed entries are ignored.
 *
 * @example negotiateLanguage('fr-CA,fr;q=0.9,en;q=0.8', ['en', 'fr']) // 'fr'
 * @param acceptLanguage - The `Accept-Language` header value.
 * @param languages - The supported languages.
 * @returns The best supported language, or `undefined` if none is acceptable.
 */
export function negotiateLanguage<L extends string>(
  acceptLanguage: string | null | undefined,
  languages: readonly L[],
): L | undefined {
  const preferences = (acceptLanguage ?? '')
    .split(',')
    .map(parsePreference)
    .filter((preference): preference is LanguagePreference => preference !== undefined && preference.quality > 0)
    // Array.prototype.sort() is stable, so preferences with the same quality keep their header order.
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of preferences) {
    const exactMatch = languages.find((language) => language.toLowerCase() === tag);

    if (exactMatch !== undefined) {
      return exactMatch;
    }

    const primarySubtag = getPrimarySubtag(tag);
    const primaryMatch = languages.find((language) => getPrimarySubtag(language.toLowerCase()) === primarySubtag);

    if (primaryMatch !== undefined) {
      return primaryMatch;
    }
  }

  return undefined;
}

function parsePreference(entry: string): LanguagePreference | undefined {
  const [range = '', ...parameters] = entry.split(';').map((part) => part.trim());
  const tag = range.toLowerCase();

  if (tag === '' || tag === '*') {
    return undefined;
  }

  const qualityParameter = parameters.find((parameter) => /^q\s*=/iu.test(parameter));
  const quality = qualityParameter === undefined ? 1 : Number(qualityParameter.replace(/^q\s*=\s*/iu, ''));

  if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
    return undefined;
  }

  return { tag, quality };
}

function getPrimarySubtag(tag: string): string {
  return tag.split('-')[0] ?? tag;
}
