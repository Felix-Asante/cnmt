import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import {
  PaymentAccountDetail,
  PaymentAccountNotFound,
} from "@/sections/payment-accounts/detail";

const parentRoute = getRouteApi("/(private)/dashboard/payment-accounts");

export const Route = createFileRoute(
  "/(private)/dashboard/payment-accounts/$id",
)({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { accounts, countries } = parentRoute.useLoaderData();
  const account = accounts.find((item) => item.id === id);

  if (!account) return <PaymentAccountNotFound />;

  return <PaymentAccountDetail account={account} countries={countries} />;
}
