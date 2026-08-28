"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { HeroIllustration } from "./hero-illustration";

const ease = [0.22, 1, 0.36, 1] as const;

export function HomeHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgb(253_232_233/0.85),transparent_52%),radial-gradient(ellipse_60%_50%_at_100%_0%,rgb(232_237_244/0.9),transparent_48%),linear-gradient(180deg,#ffffff_40%,#f7f8fa_100%)]"
      />

      <div className="relative mx-auto grid w-full max-w-[1080px] items-center gap-10 px-4 py-14 sm:px-6 md:gap-12 md:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:py-24">
        <div className="relative z-10 max-w-xl">
          <motion.p
            className="font-display text-xs font-bold tracking-[0.22em] text-brand uppercase"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            C.N Connect
          </motion.p>

          <motion.h1
            className="mt-4 font-display text-[clamp(2.75rem,6.5vw,4.35rem)] font-extrabold leading-[0.96] tracking-[0.01em] text-navy uppercase"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease }}
          >
            International
            <br />
            money transfer
            <br />
            <span className="text-brand">for everyone</span>
          </motion.h1>

          <motion.p
            className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease }}
          >
            Send money to loved ones abroad with clear rates, verified payouts,
            and delivery to mobile money or bank.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col items-start gap-4"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease }}
          >
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/transfer">
                  Send money
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/track">Track transfer</Link>
              </Button>
            </div>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted no-underline transition-colors duration-150 hover:text-navy"
            >
              How it works
            </a>
          </motion.div>
        </div>

        <HeroIllustration className="lg:translate-x-2" />
      </div>
    </section>
  );
}
