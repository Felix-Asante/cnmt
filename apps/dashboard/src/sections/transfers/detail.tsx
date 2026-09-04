import type { ReactNode } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import type { Transfer } from "@repo/types";
import { Button } from "@repo/ui/button";
import { InformationBanner } from "@repo/ui/information-banner";
import {
  formatAmount,
  formatDateTime,
  formatExchangeRate,
} from "@/utils/format";
import { getErrorMessage } from "@/utils/request";
import { TransferWorkflow } from "./actions";
import { receivingMethodLabel } from "./constants";
import { TransferPipeline } from "./pipeline";
import { TransferSheet, useCloseTransferSheet } from "./sheet";
import { TransferStatusBadge } from "./status-badge";

export function TransferDetail({ transfer }: { transfer: Transfer }) {
  const source = transfer.route.source_country;
  const destination = transfer.route.destination_country;
  const expired =
    transfer.status === "PENDING_PAYMENT" &&
    new Date(transfer.expires_at).getTime() < Date.now();
  const payoutChannel =
    transfer.recipient.receiving_method === "BANK"
      ? transfer.recipient.bank_name
      : transfer.recipient.network_name;
  const payment = transfer.payment_instructions;
  const hasPaymentInstructions = Boolean(
    payment?.payment_method ||
      payment?.channel_name ||
      payment?.account_name ||
      payment?.account_number ||
      payment?.currency_code,
  );

  return (
    <TransferSheet
      title={transfer.reference}
      description={`Created ${formatDateTime(transfer.created_at)}`}
    >
      <div className="grid grid-cols-2 border-b border-border">
        <Fact
          label="Sent"
          value={formatAmount(
            transfer.amount_sent,
            source.currency_code,
            source.currency_symbol,
          )}
        />
        <Fact
          label="Recipient gets"
          value={formatAmount(
            transfer.amount_received,
            destination.currency_code,
            destination.currency_symbol,
          )}
        />
      </div>

      <div className="border-b border-border">
        <TransferPipeline status={transfer.status} />
      </div>

      <div className="space-y-5 px-5 py-5">
        {transfer.status === "FAILED" || transfer.status === "CANCELLED" ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-navy">Status</p>
            <TransferStatusBadge status={transfer.status} />
          </div>
        ) : null}

        {expired ? (
          <InformationBanner title="Payment window expired" tone="warning">
            This transfer expired on {formatDateTime(transfer.expires_at)}.
          </InformationBanner>
        ) : null}

        <TransferWorkflow transfer={transfer} />

        <Section title="Transfer">
          <Row
            label="Fee"
            value={formatAmount(
              transfer.fee,
              source.currency_code,
              source.currency_symbol,
            )}
          />
          <Row
            label="Rate"
            value={formatExchangeRate(
              transfer.exchange_rate,
              source.currency_code || source.currency_symbol,
              destination.currency_code || destination.currency_symbol,
            )}
          />
          <Row
            label="Corridor"
            value={`${source.flag ? `${source.flag} ` : ""}${source.name} → ${destination.flag ? `${destination.flag} ` : ""}${destination.name}`}
          />
          <Row label="Sender" value={transfer.sender_phone} />
          <Row
            label="Proof"
            value={transfer.payment_proof_key ? "On file" : "Not uploaded"}
          />
          {transfer.status === "PENDING_PAYMENT" && !expired ? (
            <Row label="Expires" value={formatDateTime(transfer.expires_at)} />
          ) : null}
        </Section>

        <Section title="Recipient">
          <Row label="Name" value={transfer.recipient.name} />
          <Row
            label="Method"
            value={receivingMethodLabel(transfer.recipient.receiving_method)}
          />
          {payoutChannel ? (
            <Row
              label={
                transfer.recipient.receiving_method === "BANK"
                  ? "Bank"
                  : "Network"
              }
              value={payoutChannel}
            />
          ) : null}
          {transfer.recipient.account_number ? (
            <Row
              label="Account number"
              value={transfer.recipient.account_number}
            />
          ) : null}
          {transfer.recipient.phone ? (
            <Row label="Phone" value={transfer.recipient.phone} />
          ) : null}
        </Section>

        {hasPaymentInstructions && payment ? (
          <Section title="Payment instructions">
            {payment.payment_method ? (
              <Row
                label="Method"
                value={receivingMethodLabel(payment.payment_method)}
              />
            ) : null}
            {payment.channel_name ? (
              <Row label="Channel" value={payment.channel_name} />
            ) : null}
            {payment.account_name ? (
              <Row label="Account name" value={payment.account_name} />
            ) : null}
            {payment.account_number ? (
              <Row label="Account number" value={payment.account_number} />
            ) : null}
            {payment.currency_code ? (
              <Row label="Currency" value={payment.currency_code} />
            ) : null}
          </Section>
        ) : null}

        {transfer.notes ? (
          <section>
            <h3 className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
              Notes
            </h3>
            <p className="mt-2 border border-border px-3 py-2.5 text-sm leading-relaxed text-foreground">
              {transfer.notes}
            </p>
          </section>
        ) : null}
      </div>
    </TransferSheet>
  );
}

export function TransferDetailPending({ reference }: { reference: string }) {
  return (
    <TransferSheet title={reference} description="Loading transfer">
      <div className="space-y-3 p-5" aria-hidden>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-10 bg-surface" />
        ))}
      </div>
    </TransferSheet>
  );
}

export function TransferDetailError({ error, reset }: ErrorComponentProps) {
  const close = useCloseTransferSheet();

  return (
    <TransferSheet title="Transfer">
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-muted">{getErrorMessage(error)}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button type="button" size="sm" onClick={reset}>
            Try again
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={close}>
            Close
          </Button>
        </div>
      </div>
    </TransferSheet>
  );
}

export function TransferNotFound() {
  const close = useCloseTransferSheet();

  return (
    <TransferSheet title="Transfer">
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-muted">This transfer could not be found.</p>
        <Button type="button" size="sm" className="mt-4" onClick={close}>
          Close
        </Button>
      </div>
    </TransferSheet>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-border px-5 py-4 last:border-r-0">
      <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-navy">
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
        {title}
      </h3>
      <dl className="mt-2 border border-border">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-b border-border px-3 py-2.5 last:border-b-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium break-words text-navy">{value}</dd>
    </div>
  );
}
