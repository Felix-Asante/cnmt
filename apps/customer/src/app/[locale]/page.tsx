import HomePage from "@/sections/home";
import { getHomeTransferOptions } from "@/sections/home/api/server";

export default async function Page() {
  const transferOptions = await getHomeTransferOptions();
  return <HomePage transferOptions={transferOptions} />;
}
