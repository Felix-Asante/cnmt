export type PromoCodesSearch = {
  q?: string;
};

function optionalString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function parsePromoCodesSearch(
  search: Record<string, unknown>,
): PromoCodesSearch {
  return compactPromoCodesSearch({
    q: optionalString(search.q),
  });
}

export function compactPromoCodesSearch(
  search: PromoCodesSearch,
): PromoCodesSearch {
  return {
    ...(search.q ? { q: search.q } : {}),
  };
}

export function hasPromoCodeFilters(search: PromoCodesSearch) {
  return Boolean(search.q);
}
