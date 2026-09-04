import NewTransfer from "@/sections/new-transfer";
import { getTransferOptions } from "@/sections/new-transfer/api/server";

export const dynamic = "force-dynamic";

export default async function TransferPage() {
  const transferOptions = await getTransferOptions();
  return <NewTransfer transferOptions={transferOptions} />;
}
