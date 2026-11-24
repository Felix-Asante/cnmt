import type { TransferOptions } from "@repo/types";
import { HomeDestinations } from "./destinations";
import { HomeFinalCta } from "./final-cta";
import { HomeHero } from "./hero";
import { HomeHowItWorks } from "./how-it-works";
import { HomeTrust } from "./trust";
import { HomeWhy } from "./why";

export default function HomePage({
  transferOptions,
}: {
  transferOptions: TransferOptions;
}) {
  return (
    <main className="flex flex-1 flex-col">
      <HomeHero transferOptions={transferOptions} />
      <HomeDestinations />
      <HomeHowItWorks />
      <HomeWhy />
      <HomeTrust />
      <HomeFinalCta />
    </main>
  );
}
