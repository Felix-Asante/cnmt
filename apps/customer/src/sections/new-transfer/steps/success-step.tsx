"use client";

import { useTranslations } from "next-intl";
import { Button } from "@repo/ui/button";
import { Timeline } from "@repo/ui/timeline";
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
        <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-navy">
          {reference}
        </p>
        <Button asChild variant="ghost" size="sm" className="mt-3 h-8 px-0 text-brand">
          <Link href={`/track?ref=${encodeURIComponent(reference)}`}>
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
              <Link href="/">{t("payLater")}</Link>
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
