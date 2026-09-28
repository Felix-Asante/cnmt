"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { HOW_IT_WORKS_STEPS } from "./constants";

export function HomeHowItWorks() {
  const t = useTranslations("Home.HowItWorks");
  const reduceMotion = useReducedMotion();

  return (
    <section id="how-it-works" className="scroll-mt-20 bg-surface">
      <div className="mx-auto w-full max-w-[1080px] px-4 py-20 sm:px-6 md:py-24">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.16em] text-brand uppercase">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2.15rem]">
            {t("title")}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {t("description")}
          </p>
        </div>

        <ol className="mt-14 grid gap-0 border-t border-border md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <motion.li
              key={step}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.35,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="border-b border-border py-8 md:border-r md:border-b-0 md:px-8 md:py-10 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
            >
              <p className="font-display text-sm font-bold tracking-[0.18em] text-brand">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-navy">
                {t(`steps.${step}.title`)}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {t(`steps.${step}.description`)}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
