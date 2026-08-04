import * as React from "react";
import { cn } from "./utils";

export type TextareaProps = React.ComponentProps<"textarea">;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm text-foreground transition-colors duration-200",
        "placeholder:text-subtle",
        "hover:border-border-strong",
        "focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/15",
        "disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60",
        "aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/15",
        className,
      )}
      {...props}
    />
  );
}
