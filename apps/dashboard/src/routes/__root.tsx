import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@repo/ui/toast";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="h-full min-h-dvh bg-background font-sans text-foreground antialiased">
      <Outlet />
      <Toaster position="top-center" />
    </div>
  );
}
