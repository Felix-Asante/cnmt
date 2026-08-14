import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Field } from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import { LoginPanel } from "./panel";
import { defaultLoginValues, loginSchema, type LoginValues } from "./schema";

const ease = [0.22, 1, 0.36, 1] as const;

export default function LoginPage() {
  const reduceMotion = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const errors = form.formState.errors;

  function onSubmit(values: LoginValues) {
    void values;
  }

  return (
    <main className="grid min-h-dvh lg:h-full lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <LoginPanel />

      <section className="flex min-h-dvh flex-col bg-background px-4 py-10 sm:px-8 lg:min-h-full lg:px-12 lg:py-12">
        <div className="mb-12 flex items-center gap-3 lg:hidden">
          <span className="flex size-8 items-center justify-center bg-brand font-display text-xs font-bold tracking-wide text-white">
            CN
          </span>
          <span>
            <span className="block font-display text-sm font-bold tracking-[0.12em] text-navy uppercase">
              C.N Connect
            </span>
            <span className="block text-[11px] text-muted">
              Operations console
            </span>
          </span>
        </div>

        <motion.div
          className="m-auto w-full max-w-98"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease }}
        >
          <header className="space-y-2">
            <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
              Welcome back
            </h1>
            <p className="text-[15px] leading-relaxed text-muted">
              Sign in to manage corridors, operations, and the rest of the
              business.
            </p>
          </header>

          <form
            className="mt-10 space-y-5"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <Field
              label="Email"
              htmlFor="email"
              required
              error={errors.email?.message}
            >
              <Input
                {...form.register("email")}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="you@cnconnect.com"
              />
            </Field>

            <div className="relative">
              <Field
                label="Password"
                htmlFor="password"
                required
                error={errors.password?.message}
              >
                <Input
                  {...form.register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-11"
                />
              </Field>
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute top-7 right-1.5 flex size-8 cursor-pointer items-center justify-center text-muted transition-colors duration-150 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button type="submit" size="lg" className="w-full">
                Sign in
              </Button>
              <button
                type="button"
                className="cursor-pointer self-start text-sm font-medium text-muted transition-colors duration-150 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
              >
                Forgot password?
              </button>
            </div>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
