"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HomeTrust() {
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
          {[
            {
              title: "Verified before payout",
              text: "We confirm payment proof before processing begins.",
            },
            {
              title: "Clear references",
              text: "Every transfer gets a reference so support can help quickly.",
            },
            {
              title: "Human support",
              text: "Reach us on WhatsApp or phone when you need a hand.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="text-sm font-semibold text-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.text}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
