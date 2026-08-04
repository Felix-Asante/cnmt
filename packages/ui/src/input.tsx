import * as React from "react";
import { cn } from "./utils";

export type InputProps = React.ComponentProps<"input">;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full border border-border bg-background px-3.5 text-sm text-foreground transition-colors duration-150",
        "placeholder:text-subtle",
        "hover:border-border-strong",
        "focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/10",
        "disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60",
        "aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/10",
        className,
      )}
      {...props}
    />
  );
}
