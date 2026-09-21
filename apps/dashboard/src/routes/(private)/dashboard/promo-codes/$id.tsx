import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import {
  PromoCodeDetail,
  PromoCodeNotFound,
} from "@/sections/promo-codes/detail";

const parentRoute = getRouteApi("/(private)/dashboard/promo-codes");

export const Route = createFileRoute("/(private)/dashboard/promo-codes/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { promoCodes } = parentRoute.useLoaderData();
  const promoCode = promoCodes.find((item) => item.id === id);

  if (!promoCode) return <PromoCodeNotFound />;

  return <PromoCodeDetail promoCode={promoCode} />;
}
