"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ArrowDown, Check, Search } from "lucide-react";
import { cn } from "./utils";

export type CorridorOption = {
  id: number;
  name: string;
  flag: string;
};

type SlotProps = {
  id: string;
  label: string;
  value: string;
  options: CorridorOption[];
  onChange: (code: string) => void;
  placeholder?: string;
  error?: string;
  recentCodes?: string[];
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

function CountrySlot({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Search country",
  error,
  recentCodes = [],
}: SlotProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const selected = options.find((option) => option.id === Number(value));

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matched = normalized
      ? options.filter(
          (option) =>
            option.name.toLowerCase().includes(normalized) ||
            String(option.id).toLowerCase().includes(normalized),
        )
      : options;

    if (!recentCodes.length || normalized) return matched;

    const recent = recentCodes
      .map((id) => matched.find((option) => option.id === Number(id)))
      .filter(Boolean) as CorridorOption[];
    const rest = matched.filter(
      (option) => !recentCodes.includes(String(option.id)),
    );
    return [...recent, ...rest];
  }, [options, query, recentCodes]);

  function updatePosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function onReposition() {
      updatePosition();
    }

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  const menu =
    open && position
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-100 border border-border bg-background shadow-md"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
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
                  const isSelected = option.id === Number(value);
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onChange(String(option.id));
                          setOpen(false);
                          setQuery("");
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors duration-150",
                          isSelected ? "bg-surface" : "hover:bg-surface/70",
                        )}
                      >
                        <span className="flex size-8 items-center justify-center rounded-full bg-surface text-base ring-1 ring-border">
                          {option.flag}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {option.name}
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors duration-150",
          "hover:bg-surface/80",
          "focus-visible:outline-none focus-visible:bg-surface",
          error && "bg-brand-soft/30",
        )}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-xl leading-none ring-1 ring-border">
          <span aria-hidden>{selected?.flag ?? "🌍"}</span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium tracking-[0.14em] text-subtle uppercase">
            {label}
          </span>
          {selected ? (
            <>
              <span className="mt-0.5 block truncate text-[15px] font-semibold text-navy">
                {selected.name}
              </span>
            </>
          ) : (
            <span className="mt-0.5 block text-[15px] text-subtle">
              {placeholder}
            </span>
          )}
        </span>

        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center border border-border text-muted transition-colors duration-150",
            open && "border-navy text-navy",
          )}
          aria-hidden
        >
          <svg
            viewBox="0 0 16 16"
            className={cn(
              "size-3.5 transition-transform duration-150",
              open && "rotate-180",
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path
              d="M4 6l4 4 4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {menu}

      {error ? (
        <p className="px-4 pb-2 text-sm font-medium text-brand" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type CorridorPickerProps = {
  from: SlotProps;
  to: SlotProps;
  className?: string;
};

export function CorridorPicker({ from, to, className }: CorridorPickerProps) {
  return (
    <div className={cn("border border-border bg-background", className)}>
      <CountrySlot {...from} />

      <div className="relative">
        <div className="border-t border-border" aria-hidden />
        <div className="absolute top-1/2 left-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-border bg-background text-navy shadow-sm">
          <ArrowDown className="size-3.5" aria-hidden />
        </div>
      </div>

      <CountrySlot {...to} />
    </div>
  );
}
