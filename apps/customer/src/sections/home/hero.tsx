"use client";

import { Link } from "@/i18n/navigation";
import type { TransferOptions } from "@repo/types";
import { Button } from "@repo/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeroIllustration } from "./hero-illustration";
import { HeroQuote } from "./hero-quote";

const ease = [0.22, 1, 0.36, 1] as const;

const TRUST_POINTS = [
  { key: "speed", icon: Clock },
  { key: "verified", icon: ShieldCheck },
  // { key: "payout", icon: Smartphone },
  // { key: "support", icon: MessageCircle },
] as const;

/** Receive countries offered by any corridor, one entry per country. */
function receiveCountries(options: TransferOptions) {
  const seen = new Map<number, { id: number; flag: string; name: string }>();
  for (const country of options.destinations) {
    if (!seen.has(country.id)) {
      seen.set(country.id, {
        id: country.id,
        flag: country.flag,
        name: country.name,
      });
    }
  }
  return [...seen.values()];
}

export function HomeHero({
  transferOptions,
}: {
  transferOptions: TransferOptions;
}) {
  const t = useTranslations("Home.Hero");
  const reduceMotion = useReducedMotion();

  const hasQuote =
    transferOptions.sources.length > 0 &&
    transferOptions.destinations.length > 0;
  const countries = receiveCountries(transferOptions);

  const fadeUp = (delay: number, y = 12) => ({
    initial: reduceMotion ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease },
  });

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgb(253_232_233/0.85),transparent_52%),radial-gradient(ellipse_60%_50%_at_100%_0%,rgb(232_237_244/0.9),transparent_48%),linear-gradient(180deg,#ffffff_40%,#f7f8fa_100%)]"
      />

      <div className="relative mx-auto grid w-full max-w-page gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center lg:gap-x-20 lg:gap-y-10 lg:py-20">
        {/* Intro: first on every screen size. */}
        <div className="relative z-10 max-w-2xl lg:col-start-1 lg:row-start-1 lg:self-end">
          <motion.div {...fadeUp(0, 10)}>
            {countries.length > 0 ? (
              <p className="inline-flex items-center gap-2 border border-border bg-background/80 py-1.5 pr-3 pl-2 text-xs font-medium text-navy shadow-sm">
                <span className="flex gap-1 text-sm" aria-hidden>
                  {countries.slice(0, 4).map((country) => (
                    <span key={country.id}>{country.flag}</span>
                  ))}
                </span>
                {t("countries", { count: countries.length })}
              </p>
            ) : null}
          </motion.div>

          <motion.h1
            className="mt-5 font-display text-[clamp(2.75rem,6.5vw,5rem)] font-extrabold leading-[0.96] tracking-[0.01em] text-navy uppercase"
            {...fadeUp(0.05, 16)}
          >
            {t("titleLine1")}
            <br />
            {t("titleLine2")}{" "}
            <span className="text-brand">{t("titleAccent")}</span>
          </motion.h1>

          <motion.p
            className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg"
            {...fadeUp(0.12)}
          >
            {t("description")}
          </motion.p>

          {hasQuote ? null : (
            <motion.div
              className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
              {...fadeUp(0.2)}
            >
              <Button asChild size="lg" className="gap-2">
                <Link href="/transfer">
                  {t("sendMoney")}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/track">{t("trackTransfer")}</Link>
              </Button>
            </motion.div>
          )}
        </div>

        {/* Calculator (or illustration): second on phones, right column on desktop. */}
        <motion.div
          className="relative z-10 w-full lg:col-start-2 lg:row-span-2 lg:row-start-1"
          {...fadeUp(0.15, 20)}
        >
          {hasQuote ? (
            <HeroQuote
              transferOptions={transferOptions}
              className="mx-auto max-w-md lg:max-w-none"
            />
          ) : (
            <HeroIllustration />
          )}
        </motion.div>

        {/* Trust points and secondary links. */}
        <motion.div
          className="relative z-10 max-w-2xl lg:col-start-1 lg:row-start-2 lg:self-start"
          {...fadeUp(0.25)}
        >
          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {TRUST_POINTS.map(({ key, icon: Icon }) => (
              <li key={key} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center bg-brand-soft text-brand">
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <span className="text-navy">{t(`trust.${key}`)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium">
            {hasQuote ? (
              <Link
                href="/track"
                className="inline-flex items-center gap-1.5 text-navy underline decoration-border underline-offset-4 transition-colors duration-150 hover:decoration-navy"
              >
                {t("trackTransfer")}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            ) : null}
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 text-navy underline decoration-border underline-offset-4 transition-colors duration-150 hover:decoration-navy"
            >
              {t("howItWorks")}
              <ArrowDown className="size-3.5" aria-hidden />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
