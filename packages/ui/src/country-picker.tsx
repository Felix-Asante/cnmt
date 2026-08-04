"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "./utils";

export type PickerOption = {
  code: string;
  name: string;
  flag: string;
  meta?: string;
};

type CountryPickerProps = {
  id?: string;
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (code: string) => void;
  placeholder?: string;
  error?: string;
  recentCodes?: string[];
};

export function CountryPicker({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Search country",
  error,
  recentCodes = [],
}: CountryPickerProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.code === value);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matched = normalized
      ? options.filter(
          (option) =>
            option.name.toLowerCase().includes(normalized) ||
            option.code.toLowerCase().includes(normalized) ||
            option.meta?.toLowerCase().includes(normalized),
        )
      : options;

    if (!recentCodes.length || normalized) return matched;

    const recent = recentCodes
      .map((code) => matched.find((option) => option.code === code))
      .filter(Boolean) as PickerOption[];
    const rest = matched.filter((option) => !recentCodes.includes(option.code));
    return [...recent, ...rest];
  }, [options, query, recentCodes]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-medium tracking-wide text-muted">
        {label}
      </label>

      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-3 border bg-background px-3.5 text-left transition-colors duration-150",
          "hover:border-border-strong",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/10 focus-visible:border-navy",
          error ? "border-danger" : "border-border",
          open && "border-navy",
        )}
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-3">
            <span className="text-lg leading-none" aria-hidden>
              {selected.flag}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {selected.name}
              </span>
              {selected.meta ? (
                <span className="block truncate text-xs text-muted">
                  {selected.meta}
                </span>
              ) : null}
            </span>
          </span>
        ) : (
          <span className="text-sm text-subtle">{placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-subtle transition-transform duration-150",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className="absolute top-[calc(100%+4px)] z-40 w-full border border-border bg-background shadow-md"
          role="listbox"
          id={listId}
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="size-3.5 text-subtle" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              className="h-8 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-subtle"
              aria-label={placeholder}
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted">
                No countries found
              </li>
            ) : (
              filtered.map((option) => {
                const isSelected = option.code === value;
                return (
                  <li key={option.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(option.code);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors duration-150",
                        isSelected ? "bg-surface" : "hover:bg-surface/70",
                      )}
                    >
                      <span className="text-lg leading-none" aria-hidden>
                        {option.flag}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {option.name}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {option.meta ?? option.code}
                        </span>
                      </span>
                      {isSelected ? (
                        <Check className="size-3.5 text-navy" aria-hidden />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm font-medium text-brand">
          {error}
        </p>
      ) : null}
    </div>
  );
}
