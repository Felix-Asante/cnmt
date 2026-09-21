import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sheet } from "@/components/sheet";

export function useClosePromoCodeSheet() {
  const navigate = useNavigate();
  return () => {
    void navigate({
      to: "/dashboard/promo-codes",
      search: (prev) => prev,
    });
  };
}

export function PromoCodeSheet({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const close = useClosePromoCodeSheet();

  return (
    <Sheet
      title={title}
      description={description}
      closeLabel="Close promo code details"
      onClose={close}
    >
      {children}
    </Sheet>
  );
}
