"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

function PhoneFrame({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "relative w-[200px] overflow-hidden rounded-[2rem] border-[3px] border-navy bg-background shadow-[0_28px_60px_rgb(10_26_47/0.16)] sm:w-[220px]",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto mt-2 h-4 w-20 rounded-full bg-navy/90" />
      <div className="px-3 pt-3 pb-4">{children}</div>
    </motion.div>
  );
}

export function HeroIllustration({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "relative mx-auto aspect-[5/4] w-full max-w-[540px]",
        className,
      )}
      aria-hidden
    >
      {/* Soft LemFi-style color blobs */}
      <div className="absolute top-[8%] right-[6%] h-[58%] w-[58%] rounded-full bg-brand/10 blur-2xl" />
      <div className="absolute bottom-[4%] left-[4%] h-[48%] w-[52%] rounded-full bg-navy/8 blur-2xl" />
      <div className="absolute top-[30%] left-[18%] h-[36%] w-[36%] rounded-full bg-gold/15 blur-xl" />

      {/* Decorative rings */}
      <motion.div
        className="absolute top-[12%] left-[8%] size-24 rounded-full border border-brand/20 sm:size-28"
        animate={
          reduceMotion ? undefined : { y: [0, -8, 0], rotate: [0, 6, 0] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[4%] bottom-[18%] size-16 rounded-full border border-navy/15 sm:size-20"
        animate={reduceMotion ? undefined : { y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating corridor chip */}
      <motion.div
        className="absolute top-[10%] left-[2%] z-20 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 shadow-md sm:left-[6%]"
        initial={reduceMotion ? false : { opacity: 0, x: -12 }}
        animate={
          reduceMotion
            ? { opacity: 1, x: 0 }
            : { opacity: 1, x: 0, y: [0, -6, 0] }
        }
        transition={
          reduceMotion
            ? { duration: 0.4 }
            : {
                opacity: { duration: 0.45, delay: 0.35 },
                x: { duration: 0.45, delay: 0.35 },
                y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
              }
        }
      >
        <span className="text-base">🇬🇧</span>
        <span className="font-display text-xs font-bold tracking-wide text-navy">
          GBP → GHS
        </span>
        <span className="text-base">🇬🇭</span>
      </motion.div>

      {/* Delivered chip */}
      <motion.div
        className="absolute right-[0%] bottom-[10%] z-20 rounded-full border border-border bg-background px-3 py-2 shadow-md sm:right-[4%]"
        initial={reduceMotion ? false : { opacity: 0, x: 12 }}
        animate={
          reduceMotion
            ? { opacity: 1, x: 0 }
            : { opacity: 1, x: 0, y: [0, 7, 0] }
        }
        transition={
          reduceMotion
            ? { duration: 0.4 }
            : {
                opacity: { duration: 0.45, delay: 0.5 },
                x: { duration: 0.45, delay: 0.5 },
                y: {
                  duration: 6.2,
                  delay: 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
      >
        <p className="text-[11px] font-medium text-success">Delivered</p>
        <p className="font-display text-sm font-bold text-navy">GHS 1,642</p>
      </motion.div>

      {/* Back phone — home / balance */}
      <PhoneFrame
        className="absolute top-[6%] left-[8%] z-0 -rotate-6 sm:left-[12%]"
        delay={0.08}
      >
        <div className="rounded-2xl bg-navy px-3 py-4 text-white">
          <p className="text-[10px] text-white/55">C.N Connect</p>
          <p className="mt-1 font-display text-2xl font-bold tracking-tight">
            £250.00
          </p>
          <p className="mt-0.5 text-[10px] text-white/50">Available to send</p>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-brand/10 text-xs">
                🇬🇭
              </span>
              <div>
                <p className="text-[11px] font-semibold text-navy">Ama Osei</p>
                <p className="text-[10px] text-muted">Ghana · MTN</p>
              </div>
            </div>
            <p className="text-[11px] font-semibold text-navy">-£80</p>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-navy/5 text-xs">
                🇳🇬
              </span>
              <div>
                <p className="text-[11px] font-semibold text-navy">Chidi O.</p>
                <p className="text-[10px] text-muted">Nigeria · Bank</p>
              </div>
            </div>
            <p className="text-[11px] font-semibold text-navy">-£120</p>
          </div>
        </div>
      </PhoneFrame>

      {/* Front phone — send flow */}
      <PhoneFrame
        className="absolute top-[14%] right-[2%] z-10 rotate-[7deg] sm:right-[6%]"
        delay={0.18}
      >
        <p className="text-[10px] font-medium tracking-[0.14em] text-brand uppercase">
          New transfer
        </p>
        <p className="mt-1 font-display text-lg font-bold text-navy">
          Send money
        </p>

        <div className="mt-3 rounded-xl border border-border bg-surface px-3 py-3">
          <p className="text-[10px] text-muted">You send</p>
          <div className="mt-1 flex items-end justify-between">
            <p className="font-display text-2xl font-bold text-navy">100</p>
            <p className="text-xs font-semibold text-navy">🇬🇧 GBP</p>
          </div>
        </div>

        <div className="my-2 flex justify-center">
          <span className="flex size-6 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
            ↓
          </span>
        </div>

        <div className="rounded-xl border border-border bg-surface px-3 py-3">
          <p className="text-[10px] text-muted">They get</p>
          <div className="mt-1 flex items-end justify-between">
            <p className="font-display text-2xl font-bold text-navy">1,642</p>
            <p className="text-xs font-semibold text-navy">🇬🇭 GHS</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl bg-brand py-2.5 text-center text-[11px] font-semibold text-white">
          Continue
        </div>
      </PhoneFrame>
    </div>
  );
}
