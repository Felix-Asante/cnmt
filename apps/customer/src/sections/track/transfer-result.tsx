"use client";

import { useFormatter, useTranslations } from "next-intl";
import { TransferStatus, type Transfer } from "@repo/types";
import { Badge } from "@repo/ui/badge";
import { InformationBanner } from "@repo/ui/information-banner";
import { Timeline } from "@repo/ui/timeline";
import { TransferSummary } from "@repo/ui/transfer-summary";
import {
  formatAmount,
  formatExchangeRate,
} from "@repo/utils/money";
import {
  canContinuePayment,
  formatPromoDiscount,
  transferStatusBadgeVariant,
  transferTimelineItems,
} from "@/utils/transfer";
import { AlertCircle, ArrowRight, Clock3 } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Link } from "@/i18n/navigation";

type TransferResultProps = {
  transfer: Transfer;
};

function recipientDestination(transfer: Transfer) {
  const { recipient } = transfer;
  if (recipient.receiving_method === "BANK") {
    return [recipient.bank_name, recipient.account_number]
      .filter(Boolean)
      .join(" · ");
  }

  return [recipient.network_name, recipient.phone].filter(Boolean).join(" · ");
}

function isExpiringSoon(expiresAt: string) {
  const expires = new Date(expiresAt).getTime();
  if (Number.isNaN(expires)) return false;
  return expires - Date.now() < 1000 * 60 * 60 * 6;
}

export function TransferResult({ transfer }: TransferResultProps) {
  const t = useTranslations("Track.Result");
  const tStatus = useTranslations("Transfer.status");
  const tTimeline = useTranslations("Transfer.timeline");
  const tMethod = useTranslations("Transfer.receivingMethod");
  const format = useFormatter();

  const source = transfer.route.source_country;
  const destination = transfer.route.destination_country;
  const timeline = transferTimelineItems(transfer.status).map((item) => ({
    ...item,
    title: tTimeline(`${item.id}.title`),
    description: tTimeline(`${item.id}.description`),
  }));
  const canContinue = canContinuePayment(transfer);
  const showExpiry =
    transfer.status === TransferStatus.PENDING_PAYMENT &&
    isExpiringSoon(transfer.expires_at);

  const promo = transfer.promo_code;
  const discount = promo
    ? formatPromoDiscount(promo.discount_percentage)
    : null;

  const createdAt = new Date(transfer.created_at);
  const expiresAt = new Date(transfer.expires_at);

  const summaryItems = [
    {
      label: t("youSend"),
      value: formatAmount(
        transfer.amount_sent,
        source.currency_code,
        source.currency_symbol,
      ),
      emphasis: true,
    },
    {
      label: t("recipientGets"),
      value: formatAmount(
        transfer.amount_received,
        destination.currency_code,
        destination.currency_symbol,
      ),
      emphasis: true,
    },
    {
      label: t("route"),
      value: `${source.name} → ${destination.name}`,
    },
    {
      label: t("exchangeRate"),
      value: formatExchangeRate(
        transfer.exchange_rate,
        source.currency_code,
        destination.currency_code,
      ),
    },
    ...(promo && discount
      ? [
          {
            label: t("promo"),
            value: t("promoSummary", { code: promo.code, discount }),
          },
        ]
      : []),
    {
      label: t("submitted"),
      value: Number.isNaN(createdAt.getTime())
        ? "—"
        : format.dateTime(createdAt, {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
    },
  ];

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8">
      <div className="space-y-8">
        <header className="max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={transferStatusBadgeVariant(transfer.status)}>
              {tStatus(`${transfer.status}.label`)}
            </Badge>
            <p className="text-xs text-muted">
              {t("updated", {
                time: Number.isNaN(createdAt.getTime())
                  ? "—"
                  : format.relativeTime(createdAt),
              })}
            </p>
          </div>
          <h2 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
            {tStatus(`${transfer.status}.headline`)}
          </h2>
          <p className="text-[15px] leading-relaxed text-muted">
            {tStatus(`${transfer.status}.description`)}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="border border-border bg-surface px-5 py-4">
            <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
              {t("reference")}
            </p>
            <p className="mt-2 font-mono text-lg font-semibold tracking-wide text-navy">
              {transfer.reference}
            </p>
          </div>

          <div className="border border-border bg-background px-5 py-4">
            <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
              {t("corridor")}
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {source.name}
            </p>
            <p className="mt-1 text-sm text-muted">
              {t("corridorTo", { destination: destination.name })}
            </p>
          </div>
        </div>

        {transfer.status === TransferStatus.FAILED ||
        transfer.status === TransferStatus.CANCELLED ? (
          <InformationBanner
            title={
              transfer.status === TransferStatus.FAILED
                ? t("failedBannerTitle")
                : t("cancelledBannerTitle")
            }
            tone={
              transfer.status === TransferStatus.FAILED ? "warning" : "info"
            }
            icon={AlertCircle}
          >
            {t("terminalBannerBody")}
          </InformationBanner>
        ) : null}

        {showExpiry ? (
          <InformationBanner title={t("expiryTitle")} tone="warning">
            {t("expiryBody", {
              relative: Number.isNaN(expiresAt.getTime())
                ? "—"
                : format.relativeTime(expiresAt),
              absolute: Number.isNaN(expiresAt.getTime())
                ? "—"
                : format.dateTime(expiresAt, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
            })}
          </InformationBanner>
        ) : null}

        {transfer.status === TransferStatus.PENDING_PAYMENT ? (
          <InformationBanner title={t("paymentRequiredTitle")}>
            {t("paymentRequiredBody")}
          </InformationBanner>
        ) : null}

        {timeline.length > 0 ? (
          <div className="border border-border bg-background px-5 py-6 sm:px-6">
            <div className="flex items-center gap-2">
              <Clock3 className="size-4 text-muted" aria-hidden />
              <p className="text-sm font-medium text-foreground">
                {t("progress")}
              </p>
            </div>
            <Timeline className="mt-5" items={timeline} />
          </div>
        ) : null}

        <div className="border border-border bg-background px-5 py-6 sm:px-6">
          <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
            {t("recipient")}
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">{t("name")}</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {transfer.recipient.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t("deliveryMethod")}</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {tMethod(transfer.recipient.receiving_method)}
              </dd>
            </div>
            {recipientDestination(transfer) ? (
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted">{t("destination")}</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {recipientDestination(transfer)}
                </dd>
              </div>
            ) : null}
            {transfer.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted">{t("note")}</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {transfer.notes}
                </dd>
              </div>
            ) : null}
            {promo && discount ? (
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted">{t("promoCode")}</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {promo.code}
                  <span className="font-normal text-muted">
                    {" "}
                    · {t("promoOffFee", { discount })}
                  </span>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
          {canContinue ? (
            <Button asChild size="lg" className="gap-2">
              <Link
                href={`/transfer?ref=${encodeURIComponent(transfer.reference)}`}
              >
                {t("continuePayment")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="gap-2">
              <Link href="/transfer">
                {t("sendAnother")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg">
            <Link href="/">{t("backHome")}</Link>
          </Button>
        </div>
      </div>

      <TransferSummary
        className="mt-8 lg:mt-0 lg:sticky lg:top-24"
        title={t("summaryTitle")}
        items={summaryItems}
        receiveHighlight={formatAmount(
          transfer.amount_received,
          destination.currency_code,
          destination.currency_symbol,
        )}
        estimatedCompletion={tStatus(
          `${transfer.status}.estimatedArrival`,
        )}
        feesIncludedText={
          discount
            ? t("feesIncludedPromo", { discount })
            : undefined
        }
      />
    </div>
  );
}
