import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { PaymentAccountCreate } from "@/sections/payment-accounts/detail";

const parentRoute = getRouteApi("/(private)/dashboard/payment-accounts");

export const Route = createFileRoute(
  "/(private)/dashboard/payment-accounts/new",
)({
  component: Page,
});

function Page() {
  const { countries, countryId } = parentRoute.useLoaderData();
  return (
    <PaymentAccountCreate countries={countries} countryId={countryId} />
  );
}
