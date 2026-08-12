import NewTransfer from "@/sections/new-transfer";
import { getTransferOptions } from "@/sections/new-transfer/api/server";
import { Suspense } from "react";

export default async function TransferPage() {
  const transferOptions = await getTransferOptions();
  console.log(transferOptions);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewTransfer transferOptions={transferOptions} />
    </Suspense>
  );
}
