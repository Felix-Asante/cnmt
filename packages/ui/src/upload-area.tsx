"use client";

import * as React from "react";
import { FileText, ImageIcon, Trash2, Upload } from "lucide-react";
import {
  type FileUploadRules,
  fileHelperText,
  formatAccept,
  validateFile,
} from "@repo/utils/file";
import { formatBytes } from "@repo/utils/format-bytes";
import { cn } from "./utils";
import { Button } from "./button";

type UploadAreaProps = {
  id?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  rules?: FileUploadRules;
  accept?: string;
  maxSizeBytes?: number;
  error?: string;
  helperText?: string;
  dropLabel?: string;
  browseLabel?: string;
  previewAlt?: string;
  disabled?: boolean;
  className?: string;
};

function resolveRules({
  rules,
  accept,
  maxSizeBytes,
}: Pick<UploadAreaProps, "rules" | "accept" | "maxSizeBytes">): FileUploadRules {
  if (rules) return rules;
  return {
    accept: (accept ?? "image/png,image/jpeg,application/pdf")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    maxSizeBytes: maxSizeBytes ?? 10 * 1024 * 1024,
  };
}

export function UploadArea({
  id = "file-upload",
  value,
  onChange,
  rules,
  accept,
  maxSizeBytes,
  error,
  helperText,
  dropLabel = "Drop file here",
  browseLabel = "browse files",
  previewAlt = "File preview",
  disabled = false,
  className,
}: UploadAreaProps) {
  const resolvedRules = resolveRules({ rules, accept, maxSizeBytes });
  const resolvedAccept = accept ?? formatAccept(resolvedRules.accept);
  const resolvedHelper = helperText ?? fileHelperText(resolvedRules);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const displayError = error ?? localError ?? undefined;
  const errorId = displayError ? `${id}-error` : undefined;
  const helperId = resolvedHelper ? `${id}-helper` : undefined;

  React.useEffect(() => {
    if (!value || !value.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  function assignFile(file: File | undefined) {
    if (!file || disabled) return;
    const message = validateFile(file, resolvedRules);
    if (message) {
      setLocalError(message);
      return;
    }
    setLocalError(null);
    onChange(file);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={resolvedAccept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => assignFile(event.target.files?.[0])}
        aria-invalid={Boolean(displayError) || undefined}
        aria-describedby={
          [helperId, errorId].filter(Boolean).join(" ") || undefined
        }
      />

      {!value ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          onClick={() => {
            if (!disabled) inputRef.current?.click();
          }}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (!disabled) assignFile(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex flex-col items-center justify-center border border-dashed px-6 py-14 text-center transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/15",
            disabled
              ? "cursor-not-allowed border-border bg-surface opacity-60"
              : "cursor-pointer border-border-strong bg-surface hover:border-navy/40 hover:bg-background",
            dragging && !disabled && "border-navy bg-navy-soft/40",
            displayError &&
              !disabled &&
              "border-danger bg-brand-soft/20",
          )}
        >
          <Upload className="size-5 text-navy" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground">{dropLabel}</p>
          <p className="mt-1 text-sm text-muted">
            or <span className="font-medium text-navy">{browseLabel}</span>
          </p>
          {resolvedHelper ? (
            <p id={helperId} className="mt-3 text-xs text-subtle">
              {resolvedHelper}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden border border-border bg-background">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={previewAlt}
              className="h-48 w-full object-cover"
            />
          ) : (
            <div className="flex h-36 items-center justify-center bg-surface">
              <FileText className="size-8 text-muted" aria-hidden />
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center bg-surface text-navy">
                {value.type.startsWith("image/") ? (
                  <ImageIcon className="size-4" aria-hidden />
                ) : (
                  <FileText className="size-4" aria-hidden />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {value.name}
                </p>
                <p className="text-xs text-muted">{formatBytes(value.size)}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove file"
                onClick={() => {
                  onChange(null);
                  setLocalError(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                disabled={disabled}
              >
                <Trash2 className="size-4 text-muted" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {displayError ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-brand">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}
