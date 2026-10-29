"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { ArrowDown, Check, Search, X } from "lucide-react";
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

const MOBILE_MQ = "(max-width: 767px)";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, [locked]);
}

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
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
  const selected = options.find((option) => option.id === Number(value));

  useEffect(() => {
    setMounted(true);
  }, []);

  useBodyScrollLock(open && isMobile);

  const { recent, rest, filtered } = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matched = normalized
      ? options.filter(
          (option) =>
            option.name.toLowerCase().includes(normalized) ||
            String(option.id).toLowerCase().includes(normalized),
        )
      : options;

    if (!recentCodes.length || normalized) {
      return { recent: [] as CorridorOption[], rest: matched, filtered: matched };
    }

    const recentOptions = recentCodes
      .map((code) => matched.find((option) => option.id === Number(code)))
      .filter(Boolean) as CorridorOption[];
    const restOptions = matched.filter(
      (option) => !recentCodes.includes(String(option.id)),
    );
    return {
      recent: recentOptions,
      rest: restOptions,
      filtered: [...recentOptions, ...restOptions],
    };
  }, [options, query, recentCodes]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function select(option: CorridorOption) {
    onChange(String(option.id));
    close();
  }

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
    if (!open || isMobile) return;
    updatePosition();
  }, [open, isMobile]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        setQuery("");
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open || isMobile) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setQuery("");
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
  }, [open, isMobile]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, isMobile]);

  function renderOption(option: CorridorOption, compact = false) {
    const isSelected = option.id === Number(value);
    return (
      <li key={option.id}>
        <button
          type="button"
          role="option"
          aria-selected={isSelected}
          onClick={() => select(option)}
          className={cn(
            "flex w-full items-center gap-3 text-left transition-colors duration-150",
            compact ? "px-3.5 py-2.5" : "px-4 py-3.5",
            isSelected ? "bg-surface" : "active:bg-surface hover:bg-surface/70",
          )}
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full bg-surface leading-none ring-1 ring-border",
              compact ? "size-8 text-base" : "size-10 text-lg",
            )}
          >
            {option.flag}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate font-medium text-foreground",
                compact ? "text-sm" : "text-[15px]",
              )}
            >
              {option.name}
            </span>
          </span>
          {isSelected ? (
            <Check className="size-4 shrink-0 text-navy" aria-hidden />
          ) : null}
        </button>
      </li>
    );
  }

  function renderList(compact = false) {
    if (filtered.length === 0) {
      return (
        <li className="px-4 py-10 text-center text-sm text-muted">
          No countries found
        </li>
      );
    }

    if (!recent.length || query.trim()) {
      return filtered.map((option) => renderOption(option, compact));
    }

    return (
      <>
        <li
          className={cn(
            "px-4 py-2 text-[11px] font-medium tracking-[0.14em] text-subtle uppercase",
            compact && "px-3.5",
          )}
        >
          Recent
        </li>
        {recent.map((option) => renderOption(option, compact))}
        {rest.length > 0 ? (
          <li
            className={cn(
              "px-4 py-2 text-[11px] font-medium tracking-[0.14em] text-subtle uppercase",
              compact && "px-3.5",
            )}
          >
            All countries
          </li>
        ) : null}
        {rest.map((option) => renderOption(option, compact))}
      </>
    );
  }

  const desktopMenu =
    open && !isMobile && position && mounted
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-100 border border-border bg-background shadow-md"
            style={
              {
                top: position.top,
                left: position.left,
                width: position.width,
              } satisfies CSSProperties
            }
            role="listbox"
            id={listId}
            aria-labelledby={id}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="size-3.5 text-subtle" aria-hidden />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                className="h-8 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-subtle"
                aria-label={placeholder}
              />
            </div>
            <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
              {renderList(true)}
            </ul>
          </div>,
          document.body,
        )
      : null;

  const mobileSheet =
    open && isMobile && mounted
      ? createPortal(
          <div className="fixed inset-0 z-100 flex flex-col justify-end">
            <button
              type="button"
              aria-label="Close"
              className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"
              onClick={close}
            />

            <div
              ref={menuRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative z-10 flex max-h-[min(92dvh,920px)] min-h-[min(62dvh,560px)] w-full flex-col rounded-t-2xl border border-border border-b-0 bg-background shadow-[0_-12px_40px_rgb(10_26_47/0.18)]"
              style={{
                paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
              }}
            >
              <div className="flex shrink-0 flex-col items-center pt-2.5 pb-1">
                <div
                  className="h-1 w-10 rounded-full bg-border-strong"
                  aria-hidden
                />
              </div>

              <div className="flex shrink-0 items-start justify-between gap-3 px-4 pt-1 pb-3">
                <div className="min-w-0">
                  <p
                    id={titleId}
                    className="text-[11px] font-medium tracking-[0.14em] text-subtle uppercase"
                  >
                    {label}
                  </p>
                  <p className="mt-0.5 truncate text-lg font-semibold text-navy">
                    Choose a country
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="flex size-10 shrink-0 items-center justify-center border border-border text-muted transition-colors hover:border-border-strong hover:text-navy"
                  aria-label="Close country picker"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>

              <div className="mx-4 mb-3 flex shrink-0 items-center gap-2.5 border border-border bg-surface px-3.5 py-2.5">
                <Search className="size-4 shrink-0 text-subtle" aria-hidden />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={placeholder}
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="h-7 w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-subtle"
                  aria-label={placeholder}
                  aria-controls={listId}
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-xs font-medium text-muted"
                  >
                    Clear
                  </button>
                ) : null}
              </div>

              <ul
                id={listId}
                role="listbox"
                aria-labelledby={titleId}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] pb-2"
              >
                {renderList(false)}
              </ul>
            </div>
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
        aria-haspopup={isMobile ? "dialog" : "listbox"}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
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
            <span className="mt-0.5 block truncate text-[15px] font-semibold text-navy">
              {selected.name}
            </span>
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

      {desktopMenu}
      {mobileSheet}

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
