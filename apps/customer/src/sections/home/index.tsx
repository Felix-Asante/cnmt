import { HomeDestinations } from "./destinations";
import { HomeFinalCta } from "./final-cta";
import { HomeHero } from "./hero";
import { HomeHowItWorks } from "./how-it-works";
import { HomeTrust } from "./trust";
import { HomeWhy } from "./why";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <HomeHero />
      <HomeDestinations />
      <HomeHowItWorks />
      <HomeWhy />
      <HomeTrust />
      <HomeFinalCta />
    </main>
  );
}
