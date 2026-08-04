"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "./utils";

export type StepperStep = {
  id: string;
  label: string;
};

type StepperProps = {
  steps: StepperStep[];
  currentStep: number;
  className?: string;
};

export function Stepper({ steps, currentStep, className }: StepperProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <nav aria-label="Transfer progress" className={cn("w-full", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">
            Step {currentStep + 1}
          </span>
          <span className="text-subtle"> of {steps.length}</span>
          <span className="mx-2 text-border-strong">·</span>
          <span className="text-foreground">{steps[currentStep]?.label}</span>
        </p>
        <ol className="hidden items-center gap-5 sm:flex">
          {steps.map((step, index) => {
            const status =
              index < currentStep
                ? "complete"
                : index === currentStep
                  ? "current"
                  : "upcoming";
            return (
              <li key={step.id} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full text-[10px] font-semibold",
                    status === "complete" && "bg-navy text-white",
                    status === "current" && "bg-brand text-white",
                    status === "upcoming" && "bg-border text-subtle",
                  )}
                  aria-current={status === "current" ? "step" : undefined}
                >
                  {status === "complete" ? (
                    <Check className="size-2.5" strokeWidth={3} aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    status === "current" && "font-medium text-foreground",
                    status === "complete" && "text-muted",
                    status === "upcoming" && "text-subtle",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full origin-left rounded-full bg-navy"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </nav>
  );
}
