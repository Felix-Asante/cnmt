"use client";

import {
  useDeferredValue,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
} from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  getCountryByIso,
  getPhoneCountryOptions,
  normalizePhoneToE164,
  splitPhoneNumber,
  COUNTRY_PHONE_RULES,
  type PhoneCountryOption,
} from "@repo/utils/countries";
import { cn } from "./utils";

export type PhoneInputProps = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  defaultCountry?: string; // e.g. "MA", "GH", "GB"
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  autoComplete?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

function filterCountryOptions(
  options: PhoneCountryOption[],
  query: string,
): PhoneCountryOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  const digitsOnly = q.replace(/\D/g, "");

  return options.filter((opt) => {
    return (
      opt.name.toLowerCase().includes(q) ||
      opt.iso_code.toLowerCase().includes(q) ||
      opt.calling_code.includes(q) ||
      (digitsOnly && opt.calling_code.replace(/\D/g, "").includes(digitsOnly))
    );
  });
}

export function PhoneInput({
  id,
  name,
  value,
  defaultValue = "",
  onChange,
  onBlur,
  defaultCountry = "MA",
  placeholder,
  disabled,
  required,
  error,
  className,
  autoComplete = "tel",
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: PhoneInputProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownListId = useId();

  const countryOptions = getPhoneCountryOptions();

  // Initial parse from value or defaultValue
  const initialNumber = value !== undefined ? value : defaultValue;
  const initialParsed = splitPhoneNumber(initialNumber, defaultCountry);

  const [selectedIso, setSelectedIso] = useState<string>(
    initialParsed.isoCode || defaultCountry.toUpperCase(),
  );
  const [localDigits, setLocalDigits] = useState<string>(
    initialParsed.nationalNumber,
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const activeCountry =
    countryOptions.find((c: PhoneCountryOption) => c.iso_code === selectedIso) ??
    countryOptions.find((c: PhoneCountryOption) => c.iso_code === defaultCountry.toUpperCase()) ??
    countryOptions[0]!;

  const callingCode = activeCountry?.calling_code ?? "+212";
  const activeRule = COUNTRY_PHONE_RULES[selectedIso];
  const resolvedPlaceholder = placeholder || activeRule?.placeholder || "638 118 002";

  // If defaultCountry prop changes and user hasn't explicitly entered an international number for another country
  const prevDefaultCountryRef = useRef(defaultCountry);
  useEffect(() => {
    if (prevDefaultCountryRef.current !== defaultCountry) {
      prevDefaultCountryRef.current = defaultCountry;
      // If current value is empty or matches previous default calling code, adapt to new defaultCountry
      if (!value || !value.startsWith("+")) {
        const nextIso = defaultCountry.toUpperCase();
        setSelectedIso(nextIso);
        const nextEntry = getCountryByIso(nextIso);
        const nextCode = nextEntry?.calling_code || "+212";
        if (localDigits) {
          const nextFull = normalizePhoneToE164(localDigits, nextCode);
          onChange?.(nextFull);
        }
      }
    }
  }, [defaultCountry, localDigits, onChange, value]);

  // Sync with controlled value prop if provided (avoid overriding while user is actively typing)
  useEffect(() => {
    if (value === undefined) return;
    if (inputRef.current && document.activeElement === inputRef.current) {
      return;
    }
    if (!value) {
      setLocalDigits("");
      return;
    }
    const parsed = splitPhoneNumber(value, selectedIso);
    if (parsed.isoCode && parsed.isoCode !== selectedIso) {
      setSelectedIso(parsed.isoCode);
    }
    setLocalDigits(parsed.nationalNumber);
  }, [value, selectedIso]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [dropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      searchInputRef.current?.focus();
    }
  }, [dropdownOpen]);

  const filteredOptions = filterCountryOptions(countryOptions, deferredSearch);

  function handleSelectCountry(option: PhoneCountryOption) {
    setSelectedIso(option.iso_code);
    setDropdownOpen(false);
    setSearchQuery("");
    inputRef.current?.focus();

    if (localDigits) {
      const fullNumber = normalizePhoneToE164(localDigits, option.calling_code);
      onChange?.(fullNumber);
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;

    // Check if user pasted a full international number with +
    if (raw.trim().startsWith("+")) {
      const parsed = splitPhoneNumber(raw, selectedIso);
      setSelectedIso(parsed.isoCode);
      setLocalDigits(parsed.nationalNumber);
      const full = normalizePhoneToE164(parsed.nationalNumber, parsed.callingCode);
      onChange?.(full);
      return;
    }

    // Keep digits and clean input
    const cleaned = raw.replace(/[^\d\s()-]/g, "");
    setLocalDigits(cleaned);

    const nationalDigits = cleaned.replace(/\D/g, "").replace(/^0+/, "");
    const fullNumber = nationalDigits
      ? normalizePhoneToE164(nationalDigits, callingCode)
      : "";
    onChange?.(fullNumber);
  }

  function handleInputBlur(event: FocusEvent<HTMLInputElement>) {
    // Strip leading 0 on blur for clean formatting if national number had leading 0
    const digitsOnly = localDigits.replace(/\D/g, "");
    if (digitsOnly.startsWith("0")) {
      const cleaned = digitsOnly.replace(/^0+/, "");
      setLocalDigits(cleaned);
      if (cleaned) {
        const full = normalizePhoneToE164(cleaned, callingCode);
        onChange?.(full);
      }
    }
    onBlur?.(event);
  }

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex h-11 w-full border border-border bg-background transition-colors duration-150",
          "hover:border-border-strong",
          "focus-within:border-navy focus-within:ring-2 focus-within:ring-navy/10",
          disabled && "cursor-not-allowed bg-surface opacity-60",
          (error || ariaInvalid) &&
            "border-danger focus-within:border-danger focus-within:ring-danger/10",
        )}
      >
        {/* Country code selector button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setDropdownOpen((prev) => !prev)}
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-label={`Select country code. Current: ${activeCountry.name} (${callingCode})`}
          className={cn(
            "flex h-full shrink-0 items-center gap-1.5 border-r border-border bg-surface/50 px-3 text-sm font-medium text-foreground transition-colors",
            "hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <span className="text-base leading-none" aria-hidden>
            {activeCountry.flag}
          </span>
          <span className="font-mono text-xs font-semibold text-navy">
            {callingCode}
          </span>
          <ChevronDown
            className={cn(
              "size-3.5 text-muted transition-transform duration-150",
              dropdownOpen && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {/* Local phone number digits input */}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          value={localDigits}
          placeholder={resolvedPlaceholder}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          aria-invalid={Boolean(error) || ariaInvalid || undefined}
          aria-describedby={ariaDescribedBy}
          className="h-full w-full min-w-0 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-subtle disabled:cursor-not-allowed"
        />
      </div>

      {/* Country selection dropdown menu */}
      {dropdownOpen ? (
        <div
          id={dropdownListId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-72 w-72 overflow-hidden border border-border bg-background shadow-lg outline-none sm:w-80"
        >
          {/* Search box inside dropdown */}
          <div className="border-b border-border p-2">
            <div className="flex items-center gap-2 border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus-within:border-navy">
              <Search className="size-3.5 shrink-0 text-muted" aria-hidden />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code…"
                className="w-full bg-transparent outline-none placeholder:text-subtle"
              />
            </div>
          </div>

          {/* List of countries */}
          <div className="max-h-56 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted">
                No countries found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.iso_code === selectedIso;
                return (
                  <button
                    key={opt.iso_code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectCountry(opt)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left text-xs transition-colors",
                      isSelected
                        ? "bg-navy/5 font-semibold text-navy"
                        : "text-foreground hover:bg-surface",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-base leading-none shrink-0" aria-hidden>
                        {opt.flag}
                      </span>
                      <span className="truncate">{opt.name}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 font-mono text-muted">
                      <span>{opt.calling_code}</span>
                      {isSelected ? (
                        <Check className="size-3.5 text-navy" aria-hidden />
                      ) : null}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
