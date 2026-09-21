import { Link, useNavigate, useParams } from "@tanstack/react-router";
import type { PromoCode } from "@repo/types";
import { Badge } from "@repo/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";
import {
  formatDiscountPercent,
  promoWindowBadgeVariant,
  promoWindowLabel,
  promoWindowStatus,
} from "./schema";

export function PromoCodeTable({ promoCodes }: { promoCodes: PromoCode[] }) {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const selected = typeof params.id === "string" ? params.id : undefined;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <HeaderCell>Code</HeaderCell>
            <HeaderCell>Discount</HeaderCell>
            <HeaderCell>Window</HeaderCell>
            <HeaderCell>Uses</HeaderCell>
            <HeaderCell>Status</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {promoCodes.map((promo) => {
            const active = selected === promo.id;
            const status = promoWindowStatus(promo.start_date, promo.end_date);

            return (
              <tr
                key={promo.id}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "cursor-pointer border-b border-border last:border-b-0",
                  active ? "bg-navy-soft" : "hover:bg-surface",
                )}
                onClick={() =>
                  void navigate({
                    to: "/dashboard/promo-codes/$id",
                    params: { id: promo.id },
                    search: (prev) => prev,
                  })
                }
              >
                <td className="px-4 py-3.5">
                  <Link
                    to="/dashboard/promo-codes/$id"
                    params={{ id: promo.id }}
                    search={(prev) => prev}
                    onClick={(event) => event.stopPropagation()}
                    className="font-mono font-medium tracking-wide text-navy no-underline hover:underline"
                  >
                    {promo.code}
                  </Link>
                </td>
                <td className="px-4 py-3.5 tabular-nums text-foreground">
                  {formatDiscountPercent(promo.discount_percentage)}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-foreground">
                  {formatDate(promo.start_date)}
                  <span className="text-subtle"> – </span>
                  {formatDate(promo.end_date)}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-foreground">
                  {promo.max_uses_per_user} / {promo.max_uses}
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant={promoWindowBadgeVariant(status)}>
                    {promoWindowLabel(status)}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HeaderCell({ children }: { children: string }) {
  return (
    <th className="px-4 py-3 text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
      {children}
    </th>
  );
}
