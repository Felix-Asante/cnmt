"use client";

import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Timeline } from "@repo/ui/timeline";

type SuccessStepProps = {
  reference: string;
  variant: "submitted" | "complete";
  onPayNow?: () => void;
  onCreateAnother: () => void;
};

export function SuccessStep({
  reference,
  variant,
  onPayNow,
  onCreateAnother,
}: SuccessStepProps) {
  const isSubmitted = variant === "submitted";

  return (
    <div className="space-y-10">
      <header className="max-w-lg space-y-3">
        <p className="text-xs font-medium tracking-[0.16em] text-brand uppercase">
          {isSubmitted ? "Request received" : "Proof received"}
        </p>
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
          {isSubmitted
            ? "Your transfer request is ready"
            : "We’re verifying your payment"}
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          {isSubmitted
            ? "Next, send the payment using the details we provide. Keep your reference handy."
            : "You’ll get updates as we confirm the transfer and pay out to the recipient."}
        </p>
      </header>

      <div className="border border-border bg-surface px-5 py-4">
        <p className="text-xs text-muted">Reference</p>
        <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-navy">
          {reference}
        </p>
        <Button asChild variant="ghost" size="sm" className="mt-3 h-8 px-0 text-brand">
          <Link href={`/track?ref=${encodeURIComponent(reference)}`}>
            Track this transfer
          </Link>
        </Button>
      </div>

      <div>
        <p className="text-xs font-medium tracking-wide text-muted">
          What happens next
        </p>
        <Timeline
          className="mt-5"
          items={[
            {
              id: "request",
              title: "Request submitted",
              description: "Transfer details saved securely.",
              status: "complete",
            },
            {
              id: "payment",
              title: "Payment",
              description: "Send the exact amount with your reference.",
              status: isSubmitted ? "current" : "complete",
            },
            {
              id: "verification",
              title: "Verification",
              description: "We confirm your payment proof.",
              status: isSubmitted ? "upcoming" : "current",
            },
            {
              id: "completed",
              title: "Payout complete",
              description: "Recipient receives the funds.",
              status: "upcoming",
            },
          ]}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
        {isSubmitted && onPayNow ? (
          <>
            <Button type="button" size="lg" onClick={onPayNow}>
              Continue to payment
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Pay later</Link>
            </Button>
          </>
        ) : (
          <>
            <Button type="button" size="lg" onClick={onCreateAnother}>
              Send another
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Back home</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
