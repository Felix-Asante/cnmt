"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Timeline } from "@repo/ui/timeline";
import { toast } from "@repo/ui/toast";
import { Link } from "@/i18n/navigation";

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
  const t = useTranslations("NewTransfer.Success");
  const isSubmitted = variant === "submitted";
  const [copied, setCopied] = useState(false);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      toast.success(t("copied"));
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  return (
    <div className="space-y-10">
      <header className="max-w-lg space-y-3">
        <p className="text-xs font-medium tracking-[0.16em] text-brand uppercase">
          {isSubmitted ? t("submittedEyebrow") : t("completeEyebrow")}
        </p>
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
          {isSubmitted ? t("submittedTitle") : t("completeTitle")}
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          {isSubmitted ? t("submittedDescription") : t("completeDescription")}
        </p>
      </header>

      <div className="border border-border bg-surface px-5 py-4">
        <p className="text-xs text-muted">{t("reference")}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="font-mono text-lg font-semibold tracking-wide text-navy">
            {reference}
          </p>
          <button
            type="button"
            onClick={copyReference}
            className="cursor-pointer inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-xs font-medium text-navy transition-colors duration-150 hover:border-navy hover:bg-background"
          >
            {copied ? (
              <Check className="size-3.5 text-success" aria-hidden />
            ) : (
              <Copy className="size-3.5" aria-hidden />
            )}
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t("referenceHint")}
        </p>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mt-2 h-8 px-0 text-brand"
        >
          <Link
            target="_blank"
            href={`/track?ref=${encodeURIComponent(reference)}`}
          >
            {t("track")}
          </Link>
        </Button>
      </div>

      <div>
        <p className="text-xs font-medium tracking-wide text-muted">
          {t("whatNext")}
        </p>
        <Timeline
          className="mt-5"
          items={[
            {
              id: "request",
              title: t("timeline.request.title"),
              description: t("timeline.request.description"),
              status: "complete",
            },
            {
              id: "payment",
              title: t("timeline.payment.title"),
              description: t("timeline.payment.description"),
              status: isSubmitted ? "current" : "complete",
            },
            {
              id: "verification",
              title: t("timeline.verification.title"),
              description: t("timeline.verification.description"),
              status: isSubmitted ? "upcoming" : "current",
            },
            {
              id: "completed",
              title: t("timeline.completed.title"),
              description: t("timeline.completed.description"),
              status: "upcoming",
            },
          ]}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
        {isSubmitted && onPayNow ? (
          <>
            <Button type="button" size="lg" onClick={onPayNow}>
              {t("continuePayment")}
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/track?ref=${encodeURIComponent(reference)}`}>
                {t("payLater")}
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Button type="button" size="lg" onClick={onCreateAnother}>
              {t("sendAnother")}
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">{t("backHome")}</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
