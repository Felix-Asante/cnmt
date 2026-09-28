"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { TRUST_KEYS } from "./constants";

export function HomeTrust() {
  const t = useTranslations("Home.Trust");
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto w-full max-w-[1080px] px-4 py-14 sm:px-6">
        <motion.div
          className="grid gap-8 md:grid-cols-3"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {TRUST_KEYS.map((key) => (
            <div key={key}>
              <h3 className="text-sm font-semibold text-navy">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t(`${key}.text`)}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
