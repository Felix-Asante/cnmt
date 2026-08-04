import * as React from "react";
import { cn } from "./utils";
import { Label } from "./label";

type FieldProps = {
  label: string;
  htmlFor: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Field({
  label,
  htmlFor,
  description,
  error,
  required,
  className,
  children,
}: FieldProps) {
  const descriptionId = description ? `${htmlFor}-description` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-xs font-medium tracking-wide text-muted"
      >
        {label}
        {required ? (
          <span className="text-brand" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </Label>
      {React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<Record<string, unknown>>,
            {
              id: htmlFor,
              "aria-invalid": Boolean(error) || undefined,
              "aria-describedby":
                [descriptionId, errorId].filter(Boolean).join(" ") || undefined,
            },
          )
        : children}
      {description && !error ? (
        <p id={descriptionId} className="text-xs text-muted">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-brand">
          {error}
        </p>
      ) : null}
    </div>
  );
}
