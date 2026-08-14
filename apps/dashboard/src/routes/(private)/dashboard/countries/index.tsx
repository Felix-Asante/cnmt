import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/dashboard-page";

export const Route = createFileRoute("/(private)/dashboard/countries/")({
  component: Page,
});

function Page() {
  return <DashboardPage title="Countries" />;
}
