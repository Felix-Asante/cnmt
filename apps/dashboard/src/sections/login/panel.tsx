import { motion, useReducedMotion } from "framer-motion";
import { LOGIN_OPERATIONS } from "./constants";

const ease = [0.22, 1, 0.36, 1] as const;

export function LoginPanel() {
  const reduceMotion = useReducedMotion();

  return (
    <aside className="relative hidden min-h-dvh overflow-hidden bg-navy text-white lg:flex lg:h-full lg:min-h-full lg:flex-col lg:justify-between">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_0%_0%,rgb(208_16_24/0.22),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_100%,rgb(232_163_23/0.12),transparent_50%)]"
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-brand" />

      <div className="relative flex flex-1 flex-col justify-between px-10 py-12 xl:px-14 xl:py-14">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="flex items-center gap-3"
        >
          <span className="flex size-9 items-center justify-center bg-brand font-display text-xs font-bold tracking-wide text-white">
            CN
          </span>
          <span>
            <span className="block font-display text-sm font-bold tracking-[0.14em] uppercase">
              C.N Connect
            </span>
            <span className="block text-[11px] text-white/55">
              Operations console
            </span>
          </span>
        </motion.div>

        <div className="max-w-md">
          <motion.h2
            className="font-display text-white text-[2.75rem] font-extrabold leading-[0.96] tracking-[0.01em] uppercase"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06, ease }}
          >
            Run the
            <br />
            whole
            <br />
            <span className="text-brand">business.</span>
          </motion.h2>
          <motion.p
            className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/65"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease }}
          >
            One console for corridors, operations, and everything that keeps
            C.N Connect running.
          </motion.p>
        </div>

        <motion.ol
          className="max-w-md space-y-6 border-t border-white/10 pt-8"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.18, ease }}
        >
          {LOGIN_OPERATIONS.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="font-display text-sm font-bold tracking-[0.16em] text-brand">
                {item.step}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/55">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </motion.ol>
      </div>
    </aside>
  );
}
