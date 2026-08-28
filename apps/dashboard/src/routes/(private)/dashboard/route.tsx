import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import { isAuthenticated } from "@/utils/auth";

export const Route = createFileRoute("/(private)/dashboard")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/" });
    }
  },
  component: DashboardShell,
});
