export type DashboardSearch = {
  from?: string;
  to?: string;
};

export type DashboardPreset =
  | "this_month"
  | "this_year"
  | "today"
  | "yesterday"
  | "last_7"
  | "last_30"
  | "custom";

export const MAX_RANGE_DAYS = 366;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** Format a UTC calendar day as YYYY-MM-DD. */
export function toUtcDateString(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function rangeForPreset(
  preset: Exclude<DashboardPreset, "custom">,
  now = new Date(),
): DashboardSearch {
  const today = startOfUtcDay(now);

  if (preset === "today") {
    const day = toUtcDateString(today);
    return { from: day, to: day };
  }

  if (preset === "yesterday") {
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const day = toUtcDateString(yesterday);
    return { from: day, to: day };
  }

  if (preset === "last_7") {
    const from = new Date(today);
    from.setUTCDate(from.getUTCDate() - 6);
    return { from: toUtcDateString(from), to: toUtcDateString(today) };
  }

  if (preset === "last_30") {
    const from = new Date(today);
    from.setUTCDate(from.getUTCDate() - 29);
    return { from: toUtcDateString(from), to: toUtcDateString(today) };
  }

  if (preset === "this_year") {
    const yearStart = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
    return {
      from: toUtcDateString(yearStart),
      to: toUtcDateString(today),
    };
  }

  const monthStart = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1),
  );
  return {
    from: toUtcDateString(monthStart),
    to: toUtcDateString(today),
  };
}

export function presetFromSearch(
  search: DashboardSearch,
): DashboardPreset {
  if (!search.from && !search.to) return "this_month";

  for (const preset of [
    "today",
    "yesterday",
    "last_7",
    "last_30",
    "this_month",
    "this_year",
  ] as const) {
    const range = rangeForPreset(preset);
    if (search.from === range.from && search.to === range.to) return preset;
  }

  return "custom";
}

function optionalDate(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
  return trimmed;
}

export function parseDashboardSearch(
  search: Record<string, unknown>,
): DashboardSearch {
  const from = optionalDate(search.from);
  const to = optionalDate(search.to);

  if (from && to) return { from, to };
  return {};
}

export function compactDashboardSearch(
  search: DashboardSearch,
): DashboardSearch {
  if (search.from && search.to) return { from: search.from, to: search.to };
  return {};
}

/** API `period.to` is exclusive; convert for display. */
export function inclusivePeriodEnd(toIso: string) {
  const date = new Date(toIso);
  if (Number.isNaN(date.getTime())) return toIso;
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString();
}

export function validateCustomRange(from: string, to: string) {
  if (!from || !to) return "Choose a start and end date.";
  if (from > to) return "Start date must be on or before end date.";

  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Enter valid dates.";
  }

  const days =
    Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (days > MAX_RANGE_DAYS) {
    return `Date range cannot exceed ${MAX_RANGE_DAYS} days.`;
  }

  return undefined;
}

export const DASHBOARD_PRESETS: Array<{
  value: DashboardPreset;
  label: string;
}> = [
  { value: "this_month", label: "This month" },
  { value: "this_year", label: "This year" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7", label: "Last 7 days" },
  { value: "last_30", label: "Last 30 days" },
  { value: "custom", label: "Custom" },
];
