import { useCallback, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sheet } from "@/components/sheet";

export function useCloseTransferSheet() {
  const navigate = useNavigate();

  return useCallback(() => {
    navigate({
      to: "/dashboard/transfers",
      search: (prev) => prev,
    });
  }, [navigate]);
}

export function TransferSheet({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  const close = useCloseTransferSheet();

  return (
    <Sheet
      title={title}
      description={description}
      className={className}
      closeLabel="Close transfer details"
      onClose={close}
    >
      {children}
    </Sheet>
  );
}
