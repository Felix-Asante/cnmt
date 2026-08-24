import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sheet } from "@/components/sheet";

export function useCloseRouteSheet() {
  const navigate = useNavigate();
  return () => {
    void navigate({
      to: "/dashboard/routes",
      search: (prev) => prev,
    });
  };
}

export function RouteSheet({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const close = useCloseRouteSheet();

  return (
    <Sheet
      title={title}
      description={description}
      closeLabel="Close route details"
      onClose={close}
    >
      {children}
    </Sheet>
  );
}
