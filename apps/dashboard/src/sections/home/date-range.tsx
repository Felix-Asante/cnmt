import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { formatDate } from "@/utils/format";
import {
  DASHBOARD_PRESETS,
  compactDashboardSearch,
  inclusivePeriodEnd,
  presetFromSearch,
  rangeForPreset,
  validateCustomRange,
  type DashboardPreset,
  type DashboardSearch,
} from "./search";

export function DateRangeFilter({
  search,
  periodFrom,
  periodTo,
}: {
  search: DashboardSearch;
  periodFrom: string;
  periodTo: string;
}) {
  const navigate = useNavigate();
  const matchedPreset = presetFromSearch(search);
  const defaults = rangeForPreset("this_month");
  const [customMode, setCustomMode] = useState(matchedPreset === "custom");
  const [draftFrom, setDraftFrom] = useState(search.from ?? defaults.from!);
  const [draftTo, setDraftTo] = useState(search.to ?? defaults.to!);
  const [error, setError] = useState<string>();

  const selectValue: DashboardPreset = customMode ? "custom" : matchedPreset;
  const showCustom = selectValue === "custom";
  const periodLabel = `${formatDate(periodFrom)} – ${formatDate(inclusivePeriodEnd(periodTo))}`;

  function applySearch(next: DashboardSearch) {
    void navigate({
      to: "/dashboard",
      search: compactDashboardSearch(next),
    });
  }

  function onPresetChange(value: string) {
    const nextPreset = value as DashboardPreset;
    setError(undefined);

    if (nextPreset === "custom") {
      const from = search.from ?? defaults.from!;
      const to = search.to ?? defaults.to!;
      setDraftFrom(from);
      setDraftTo(to);
      setCustomMode(true);
      return;
    }

    setCustomMode(false);
    applySearch(rangeForPreset(nextPreset));
  }

  function applyCustom() {
    const message = validateCustomRange(draftFrom, draftTo);
    if (message) {
      setError(message);
      return;
    }
    setError(undefined);
    setCustomMode(true);
    applySearch({ from: draftFrom, to: draftTo });
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <Select value={selectValue} onValueChange={onPresetChange}>
        <SelectTrigger
          className="h-9 w-full min-w-44 sm:w-auto"
          aria-label="Date range"
        >
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          {DASHBOARD_PRESETS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCustom ? (
        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            applyCustom();
          }}
        >
          <label className="grid gap-1">
            <span className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
              From
            </span>
            <Input
              type="date"
              value={draftFrom}
              max={draftTo || undefined}
              onChange={(event) => setDraftFrom(event.target.value)}
              className="h-9 w-full sm:w-36"
              aria-invalid={Boolean(error)}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
              To
            </span>
            <Input
              type="date"
              value={draftTo}
              min={draftFrom || undefined}
              onChange={(event) => setDraftTo(event.target.value)}
              className="h-9 w-full sm:w-36"
              aria-invalid={Boolean(error)}
            />
          </label>
          <Button type="submit" size="sm" className="h-9">
            Apply
          </Button>
        </form>
      ) : null}

      {error ? (
        <p role="alert" className="text-xs font-medium text-brand">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted">{periodLabel}</p>
      )}
    </div>
  );
}
