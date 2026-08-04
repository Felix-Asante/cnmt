"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "./utils";
import { Badge } from "./badge";

export type CountryOption = {
  code: string;
  name: string;
  flag: string;
  methods?: string[];
  meta?: string;
};

type CountryCardProps = {
  country: CountryOption;
  selected?: boolean;
  onSelect: (code: string) => void;
};

export function CountryCard({ country, selected, onSelect }: CountryCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(country.code)}
      aria-pressed={selected}
      whileTap={{ scale: 0.98 }}
      animate={selected ? { scale: 1 } : { scale: 1 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex w-full flex-col gap-3 rounded-2xl border bg-background p-4 text-left transition-colors duration-150 sm:p-5",
        "hover:border-border-strong hover:bg-surface/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-brand bg-brand-soft/40 shadow-sm ring-1 ring-brand/20"
          : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-xl text-2xl leading-none transition-colors duration-150",
              selected ? "bg-background" : "bg-surface",
            )}
            aria-hidden
          >
            {country.flag}
          </span>
          <div>
            <p className="font-medium text-foreground">{country.name}</p>
            <p className="mt-0.5 text-xs text-muted">
              {country.meta ?? country.code}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
            selected
              ? "border-brand bg-brand text-white"
              : "border-border-strong bg-background text-transparent group-hover:border-navy/40",
          )}
          aria-hidden
        >
          <Check className="size-3" strokeWidth={3} />
        </span>
      </div>

      {country.methods && country.methods.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {country.methods.map((method) => (
            <li key={method}>
              <Badge variant={selected ? "brand" : "neutral"}>{method}</Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {selected ? (
        <p className="text-xs font-medium text-brand">Selected</p>
      ) : null}
    </motion.button>
  );
}
