"use client";

import * as React from "react";
import { FileText, ImageIcon, Trash2, Upload } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";

type UploadAreaProps = {
  id?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  error?: string;
  helperText?: string;
  className?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadArea({
  id = "payment-proof",
  value,
  onChange,
  accept = "image/png,image/jpeg,application/pdf",
  error,
  helperText = "PNG, JPG or PDF up to 10MB",
  className,
}: UploadAreaProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;

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
    if (!file) return;
    onChange(file);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => assignFile(event.target.files?.[0])}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={
          [helperId, errorId].filter(Boolean).join(" ") || undefined
        }
      />

      {!value ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            assignFile(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center border border-dashed px-6 py-14 text-center transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/15",
            dragging
              ? "border-navy bg-navy-soft/40"
              : error
                ? "border-danger bg-brand-soft/20"
                : "border-border-strong bg-surface hover:border-navy/40 hover:bg-background",
          )}
        >
          <Upload className="size-5 text-navy" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground">
            Drop payment proof here
          </p>
          <p className="mt-1 text-sm text-muted">
            or <span className="font-medium text-navy">browse files</span>
          </p>
          {helperText ? (
            <p id={helperId} className="mt-3 text-xs text-subtle">
              {helperText}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden border border-border bg-background">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Payment proof preview"
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
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                <Trash2 className="size-4 text-muted" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-brand">
          {error}
        </p>
      ) : null}
    </div>
  );
}
