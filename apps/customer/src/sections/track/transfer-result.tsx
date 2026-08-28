"use client";

import Link from "next/link";
import type { Transfer } from "@repo/types";
import { Badge } from "@repo/ui/badge";
import { InformationBanner } from "@repo/ui/information-banner";
import { Timeline } from "@repo/ui/timeline";
import { TransferSummary } from "@repo/ui/transfer-summary";
import {
  formatAmount,
  formatDateTime,
  formatExchangeRate,
  formatRelativeTime,
} from "@repo/utils/money";
import {
  TRANSFER_STATUS_LABELS,
  receivingMethodLabel,
  transferEstimatedArrival,
  transferStatusBadgeVariant,
  transferStatusDescription,
  transferStatusHeadline,
  transferTimelineItems,
} from "@/utils/transfer";
import { AlertCircle, ArrowRight, Clock3 } from "lucide-react";
import { Button } from "@repo/ui/button";

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
  const source = transfer.route.source_country;
  const destination = transfer.route.destination_country;
  const timeline = transferTimelineItems(transfer.status);
  const showExpiry =
    transfer.status === "PENDING_PAYMENT" && isExpiringSoon(transfer.expires_at);

  const summaryItems = [
    {
      label: "You send",
      value: formatAmount(
        transfer.amount_sent,
        source.currency_code,
        source.currency_symbol,
      ),
      emphasis: true,
    },
    {
      label: "Recipient gets",
      value: formatAmount(
        transfer.amount_received,
        destination.currency_code,
        destination.currency_symbol,
      ),
      emphasis: true,
    },
    {
      label: "Route",
      value: `${source.name} → ${destination.name}`,
    },
    {
      label: "Exchange rate",
      value: formatExchangeRate(
        transfer.exchange_rate,
        source.currency_code,
        destination.currency_code,
      ),
    },
    {
      label: "Fee",
      value: formatAmount(
        transfer.fee,
        source.currency_code,
        source.currency_symbol,
      ),
    },
    {
      label: "Submitted",
      value: formatDateTime(transfer.created_at),
    },
  ];

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8">
      <div className="space-y-8">
        <header className="max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={transferStatusBadgeVariant(transfer.status)}>
              {TRANSFER_STATUS_LABELS[transfer.status]}
            </Badge>
            <p className="text-xs text-muted">
              Updated {formatRelativeTime(transfer.created_at)}
            </p>
          </div>
          <h2 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
            {transferStatusHeadline(transfer.status)}
          </h2>
          <p className="text-[15px] leading-relaxed text-muted">
            {transferStatusDescription(transfer.status)}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="border border-border bg-surface px-5 py-4">
            <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
              Reference
            </p>
            <p className="mt-2 font-mono text-lg font-semibold tracking-wide text-navy">
              {transfer.reference}
            </p>
          </div>

          <div className="border border-border bg-background px-5 py-4">
            <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
              Corridor
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {source.name}
            </p>
            <p className="mt-1 text-sm text-muted">to {destination.name}</p>
          </div>
        </div>

        {transfer.status === "FAILED" || transfer.status === "CANCELLED" ? (
          <InformationBanner
            title={
              transfer.status === "FAILED"
                ? "This transfer cannot continue"
                : "This transfer was cancelled"
            }
            tone={transfer.status === "FAILED" ? "warning" : "info"}
            icon={AlertCircle}
          >
            Contact support with your reference if you believe this is a mistake
            or need help starting a new transfer.
          </InformationBanner>
        ) : null}

        {showExpiry ? (
          <InformationBanner title="Payment window closing soon" tone="warning">
            This transfer expires {formatRelativeTime(transfer.expires_at)}.
            Send payment before {formatDateTime(transfer.expires_at)} to keep it
            active.
          </InformationBanner>
        ) : null}

        {transfer.status === "PENDING_PAYMENT" ? (
          <InformationBanner title="Payment still required">
            Send the exact amount with your reference to continue. Once we
            receive and verify payment, payout usually follows within 30
            minutes.
          </InformationBanner>
        ) : null}

        {timeline.length > 0 ? (
          <div className="border border-border bg-background px-5 py-6 sm:px-6">
            <div className="flex items-center gap-2">
              <Clock3 className="size-4 text-muted" aria-hidden />
              <p className="text-sm font-medium text-foreground">Progress</p>
            </div>
            <Timeline className="mt-5" items={timeline} />
          </div>
        ) : null}

        <div className="border border-border bg-background px-5 py-6 sm:px-6">
          <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
            Recipient
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">Name</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {transfer.recipient.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Delivery method</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {receivingMethodLabel(transfer.recipient.receiving_method)}
              </dd>
            </div>
            {recipientDestination(transfer) ? (
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted">Destination</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {recipientDestination(transfer)}
                </dd>
              </div>
            ) : null}
            {transfer.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted">Note</dt>
                <dd className="mt-1 text-sm text-foreground">{transfer.notes}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href="/transfer">
              Send another transfer
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>

      <TransferSummary
        className="mt-8 lg:mt-0 lg:sticky lg:top-24"
        title="Transfer summary"
        items={summaryItems}
        receiveHighlight={formatAmount(
          transfer.amount_received,
          destination.currency_code,
          destination.currency_symbol,
        )}
        estimatedCompletion={transferEstimatedArrival(transfer.status)}
      />
    </div>
  );
}
