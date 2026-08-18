import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@repo/ui/button";
import { Field } from "@repo/ui/field";
import { Textarea } from "@repo/ui/textarea";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  requireReason?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  pending = false,
  requireReason = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const reasonId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      if (!pending) onClose();
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onClose, pending]);

  function submit() {
    const trimmed = reason.trim();
    if (requireReason && !trimmed) {
      setError("Enter a reason.");
      return;
    }
    onConfirm(requireReason ? trimmed : undefined);
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-navy/40"
        disabled={pending}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-md border border-border bg-background p-5"
      >
        <h2 id={titleId} className="text-lg font-semibold text-navy">
          {title}
        </h2>
        <p
          id={descriptionId}
          className="mt-2 text-sm leading-relaxed text-muted"
        >
          {description}
        </p>

        {requireReason ? (
          <form
            className="mt-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <Field label="Reason" htmlFor={reasonId} required error={error}>
              <Textarea
                ref={inputRef}
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  if (error) setError(undefined);
                }}
                maxLength={1000}
                rows={4}
                placeholder="Why is this action needed?"
              />
            </Field>
          </form>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={onClose}
          >
            Back
          </Button>
          <Button type="button" size="sm" loading={pending} onClick={submit}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
