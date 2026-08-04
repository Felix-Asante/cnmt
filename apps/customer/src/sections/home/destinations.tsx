"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@repo/ui/button";
import { HOME_DESTINATIONS } from "./constants";

export function HomeDestinations() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto w-full max-w-[1080px] px-4 py-20 sm:px-6 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.16em] text-brand uppercase">
              Corridors
            </p>
            <h2 className="mt-3 text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2.15rem]">
              Send money to multiple countries
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Reach family and partners across Europe and Africa with mobile
              money or bank payout options.
            </p>
          </div>
          <Button asChild variant="outline" size="lg">
            <Link href="/transfer">Start a transfer</Link>
          </Button>
        </div>

        <motion.ul
          className="mt-12 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-5"
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.04 },
            },
          }}
        >
          {HOME_DESTINATIONS.map((country) => (
            <motion.li
              key={country.code}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="flex items-center gap-3 bg-background px-4 py-4"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-surface text-lg ring-1 ring-border">
                {country.flag}
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">
                  {country.name}
                </span>
                <span className="block text-xs text-muted">{country.code}</span>
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
