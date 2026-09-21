import { createFileRoute } from "@tanstack/react-router";
import { PromoCodeCreate } from "@/sections/promo-codes/detail";

export const Route = createFileRoute("/(private)/dashboard/promo-codes/new")({
  component: PromoCodeCreate,
});
