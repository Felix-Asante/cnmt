"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Lock, ShieldCheck, Zap } from "lucide-react";
import { WHY_POINTS } from "./constants";

const icons = [ShieldCheck, Zap, Lock] as const;

export function HomeWhy() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-background">
      <div className="mx-auto w-full max-w-[1080px] px-4 py-20 sm:px-6 md:py-24">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.16em] text-brand uppercase">
            Why C.N Connect
          </p>
          <h2 className="mt-3 text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2.15rem]">
            Built for trust on every transfer
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            C.N International Money Transfer helps people send money across
            borders electronically — with security and speed at the center.
          </p>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {WHY_POINTS.map((point, index) => {
            const Icon = icons[index] ?? ShieldCheck;
            return (
              <motion.div
                key={point.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="flex size-10 items-center justify-center border border-border bg-surface text-navy">
                  <Icon className="size-4" aria-hidden />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy">
                  {point.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {point.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
