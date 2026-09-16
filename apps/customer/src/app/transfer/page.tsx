import { redirect } from "next/navigation";
import NewTransfer from "@/sections/new-transfer";
import { getTransferOptions } from "@/sections/new-transfer/api/server";
import { getTransferByReference } from "@/sections/track/api/server";
import { canContinuePayment } from "@/utils/transfer";

export const dynamic = "force-dynamic";

type TransferPageProps = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function TransferPage({ searchParams }: TransferPageProps) {
  const { ref } = await searchParams;
  const trimmed = ref?.trim() ?? "";
  const transferOptions = await getTransferOptions();

  if (!trimmed) {
    return <NewTransfer transferOptions={transferOptions} />;
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
