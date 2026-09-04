import NewTransfer from "@/sections/new-transfer";
import { getTransferOptions } from "@/sections/new-transfer/api/server";

export default async function TransferPage() {
  const transferOptions = await getTransferOptions();
  console.log("transferOptions", transferOptions);
  return <NewTransfer transferOptions={transferOptions} />;
}
