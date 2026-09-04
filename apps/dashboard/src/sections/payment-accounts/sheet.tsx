import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sheet } from "@/components/sheet";

export function useClosePaymentAccountSheet() {
  const navigate = useNavigate();
  return () => {
    void navigate({
      to: "/dashboard/payment-accounts",
      search: (prev) => prev,
    });
  };
}

export function PaymentAccountSheet({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const close = useClosePaymentAccountSheet();

  return (
    <Sheet
      title={title}
      description={description}
      closeLabel="Close payment account details"
      onClose={close}
    >
      {children}
    </Sheet>
  );
}
