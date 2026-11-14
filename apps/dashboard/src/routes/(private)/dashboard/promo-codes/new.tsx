import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { PromoCodeCreate } from "@/sections/promo-codes/detail";

const parentRoute = getRouteApi("/(private)/dashboard/promo-codes");

export const Route = createFileRoute("/(private)/dashboard/promo-codes/new")({
  component: Page,
});

function Page() {
  const { routeOptions } = parentRoute.useLoaderData();
  return <PromoCodeCreate routeOptions={routeOptions} />;
}
