import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/dashboard-page";

export const Route = createFileRoute("/(private)/dashboard/payment-accounts")({
  component: Page,
});

function Page() {
  return <DashboardPage title="Payment accounts" />;
}
