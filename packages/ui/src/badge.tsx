import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-surface text-muted",
        brand: "bg-brand-soft text-brand",
        navy: "bg-navy-soft text-navy",
        success: "bg-success-soft text-success",
        gold: "bg-gold-soft text-navy",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export type BadgeProps = {
  className?: string;
  children?: ReactNode;
} & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, children }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>{children}</span>
  );
}
