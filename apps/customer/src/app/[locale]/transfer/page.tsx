import { redirect } from "next/navigation";
import type { TransferOptions } from "@repo/types";
import NewTransfer, { type InitialTransfer } from "@/sections/new-transfer";
import { getTransferOptions } from "@/sections/new-transfer/api/server";
import { getTransferByReference } from "@/sections/track/api/server";
import { canContinuePayment } from "@/utils/transfer";

export const dynamic = "force-dynamic";

type TransferPageProps = {
  searchParams: Promise<{
    ref?: string;
    from?: string;
    to?: string;
    amount?: string;
  }>;
};

/** Corridor and amount picked in the home page quote, if valid. */
function initialFromQuote(
  options: TransferOptions,
  params: { from?: string; to?: string; amount?: string },
): InitialTransfer | undefined {
  const source = options.sources.find(
    (country) => country.id.toString() === params.from,
  );
  if (!source) return undefined;
  const destination = options.destinations.find(
    (country) =>
      country.id.toString() === params.to &&
      country.source_country_id === source.id,
  );
  const amount = params.amount?.trim() ?? "";
  return {
    senderCountryCode: source.id.toString(),
    sendCurrency: source.currency_code,
    recipientCountryCode: destination?.id.toString(),
    sendAmount: /^\d+(\.\d{1,2})?$/.test(amount) ? amount : undefined,
  };
}

export default async function TransferPage({
  searchParams,
}: TransferPageProps) {
  const { ref, ...quoteParams } = await searchParams;
  const trimmed = ref?.trim() ?? "";
  const transferOptions = await getTransferOptions();

  if (!trimmed) {
    return (
      <NewTransfer
        transferOptions={transferOptions}
        initial={initialFromQuote(transferOptions, quoteParams)}
      />
    );
  }

  const result = await getTransferByReference(trimmed);
  if (!result.ok || !canContinuePayment(result.transfer)) {
    redirect(`/track?ref=${encodeURIComponent(trimmed)}`);
  }

  const transfer = result.transfer;

  return (
    <NewTransfer
      transferOptions={transferOptions}
      resume={{
        reference: transfer.reference,
        sendAmount: String(transfer.amount_sent),
        sendCurrency: transfer.route.source_country.currency_code ?? "GBP",
        senderCountryCode: String(transfer.route.source_country.id),
      }}
    />
  );
}
