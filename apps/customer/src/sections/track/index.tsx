"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Transfer } from "@repo/types";
import { Button } from "@repo/ui/button";
import { Field } from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import { Search } from "lucide-react";
import { getTransferByReference } from "./api/server";
import { TransferResult } from "./transfer-result";

type TrackTransferProps = {
  initialReference?: string;
};

export default function TrackTransfer({
  initialReference = "",
}: TrackTransferProps) {
  const router = useRouter();
  const [reference, setReference] = useState(initialReference);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();
  const autoSearched = useRef(false);
  const validationError =
    hasSearched && !reference.trim() ? "Enter your transfer reference." : undefined;

  function track(nextReference = reference) {
    const trimmed = nextReference.trim();
    setHasSearched(true);

    const params = trimmed ? `?ref=${encodeURIComponent(trimmed)}` : "";
    router.replace(`/track${params}`);

    if (!trimmed) {
      setError(null);
      setTransfer(null);
      return;
    }

    setError(null);
    setTransfer(null);

    startTransition(async () => {
      const result = await getTransferByReference(trimmed);
      if (result.ok) {
        setTransfer(result.transfer);
        return;
      }

      setError(result.error);
    });
  }

  useEffect(() => {
    if (autoSearched.current || !initialReference.trim()) return;
    autoSearched.current = true;
    track(initialReference);
  }, [initialReference]);

  return (
    <main className="min-h-full bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-270 px-4 py-8 sm:px-6 md:py-12">
        <div className="bg-background px-5 py-7 sm:px-8 sm:py-9 md:px-10 md:py-10">
          <header className="max-w-2xl space-y-2">
            <p className="text-xs font-medium tracking-[0.16em] text-brand uppercase">
              Track transfer
            </p>
            <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
              Check your transfer status
            </h1>
            <p className="text-[15px] leading-relaxed text-muted">
              Enter the reference from your confirmation email or receipt to see
              payment progress, verification, and payout status.
            </p>
          </header>

          <form
            className="mt-8 max-w-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              track(reference);
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field
                label="Transfer reference"
                htmlFor="reference"
                required
                error={validationError}
                className="min-w-0 flex-1"
              >
                <Input
                  id="reference"
                  name="reference"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="CNMT-01J..."
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono tracking-wide"
                />
              </Field>
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="gap-2 sm:min-w-36"
              >
                <Search className="size-4" aria-hidden />
                {isPending ? "Searching…" : "Track"}
              </Button>
            </div>
          </form>

          <div className="mt-10">
            {isPending ? (
              <SearchState
                title="Looking up your transfer"
                description="Fetching the latest status from our records."
              />
            ) : transfer ? (
              <TransferResult transfer={transfer} />
            ) : hasSearched && error ? (
              <SearchState
                title="Transfer not found"
                description={error}
              />
            ) : (
              <SearchState
                title="Ready when you are"
                description="Your reference usually starts with CNMT-. You’ll see live progress once we find a match."
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function SearchState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border border-dashed border-border bg-surface px-5 py-10 text-center sm:px-8">
      <p className="text-sm font-medium text-navy">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}
