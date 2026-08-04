"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@repo/ui/button";
import { SUPPORT } from "@/constants/support";

export function HomeFinalCta() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-navy text-white">
      <div className="mx-auto w-full max-w-[1080px] px-4 py-20 sm:px-6 md:py-24">
        <motion.div
          className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.16em] text-brand uppercase">
              Ready when you are
            </p>
            <h2 className="mt-3 text-[1.75rem] font-semibold tracking-tight text-white md:text-[2.25rem]">
              Fast money transfer at your convenience
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/65">
              Start a transfer in about a minute. Pay when you’re ready — we’ll
              verify and keep you updated through payout.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="min-w-44">
                <Link href="/transfer">Send money now</Link>
              </Button>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.03] px-5 py-5">
            <p className="text-xs font-medium tracking-[0.14em] text-white/45 uppercase">
              Talk to support
            </p>
            <p className="mt-2 text-sm text-white/65">{SUPPORT.hours}</p>
            <div className="mt-5 space-y-3">
              <a
                href={SUPPORT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white no-underline transition-colors hover:text-brand"
              >
                <MessageCircle className="size-4 text-brand" aria-hidden />
                {SUPPORT.phoneDisplay}
              </a>
              <a
                href={SUPPORT.phoneSecondaryHref}
                className="flex items-center gap-3 text-sm text-white no-underline transition-colors hover:text-brand"
              >
                <Phone className="size-4 text-brand" aria-hidden />
                {SUPPORT.phoneSecondaryDisplay}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
