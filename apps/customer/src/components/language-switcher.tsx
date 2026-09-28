"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_META: Record<
  (typeof routing.locales)[number],
  { label: string; flag: string }
> = {
  en: { label: "EN", flag: "🇬🇧" },
  fr: { label: "FR", flag: "🇫🇷" },
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(next: (typeof routing.locales)[number]) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center rounded-full border border-navy/80 bg-navy p-0.5",
        isPending && "opacity-70",
        className,
      )}
    >
      {routing.locales.map((code) => {
        const meta = LOCALE_META[code];
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            aria-label={code === "en" ? "English" : "Français"}
            disabled={isPending}
            onClick={() => switchLocale(code)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
              active
                ? "bg-white text-navy shadow-sm"
                : "text-white/85 hover:text-white",
            )}
          >
            <span className="text-sm leading-none" aria-hidden>
              {meta.flag}
            </span>
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
