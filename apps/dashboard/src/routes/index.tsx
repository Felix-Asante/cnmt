import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginPage from "@/sections/login";
import { isAuthenticated } from "@/utils/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});
