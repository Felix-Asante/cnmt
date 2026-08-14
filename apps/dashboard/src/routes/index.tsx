import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/sections/login";

export const Route = createFileRoute("/")({ component: LoginPage });
