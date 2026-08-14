import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/dashboard-page";

export const Route = createFileRoute("/(private)/dashboard/networks")({
  component: Page,
});

function Page() {
  return <DashboardPage title="Mobile networks" />;
}
