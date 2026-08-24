export type RoutesSearch = {
  source?: number;
  dest?: number;
  active?: "true" | "false";
  q?: string;
};

function optionalString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function optionalId(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n) || n <= 0) return undefined;
  return n;
}

function optionalActive(value: unknown): "true" | "false" | undefined {
  if (value === "true" || value === "false") return value;
  return undefined;
}

export function parseRoutesSearch(
  search: Record<string, unknown>,
): RoutesSearch {
  return compactRoutesSearch({
    source: optionalId(search.source),
    dest: optionalId(search.dest),
    active: optionalActive(search.active),
    q: optionalString(search.q),
  });
}

export function compactRoutesSearch(search: RoutesSearch): RoutesSearch {
  return {
    ...(search.source ? { source: search.source } : {}),
    ...(search.dest ? { dest: search.dest } : {}),
    ...(search.active ? { active: search.active } : {}),
    ...(search.q ? { q: search.q } : {}),
  };
}

export function hasRouteFilters(search: RoutesSearch) {
  return Boolean(search.source || search.dest || search.active || search.q);
}
