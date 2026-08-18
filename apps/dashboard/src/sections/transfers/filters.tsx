import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { cn } from "@/lib/utils";
import { TRANSFER_STATUS_FILTERS } from "./constants";
import {
  compactTransfersSearch,
  type TransfersSearch,
} from "./search";

export function TransferFilters({ search }: { search: TransfersSearch }) {
  const navigate = useNavigate();
  const [reference, setReference] = useState(search.reference ?? "");
  const [senderPhone, setSenderPhone] = useState(search.sender_phone ?? "");
  const [recipientPhone, setRecipientPhone] = useState(
    search.recipient_phone ?? "",
  );

  useEffect(() => {
    setReference(search.reference ?? "");
    setSenderPhone(search.sender_phone ?? "");
    setRecipientPhone(search.recipient_phone ?? "");
  }, [search.reference, search.sender_phone, search.recipient_phone]);

  function go(next: TransfersSearch) {
    void navigate({
      to: "/dashboard/transfers",
      search: compactTransfersSearch(next),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Status">
        {TRANSFER_STATUS_FILTERS.map((filter) => {
          const active = search.status === filter.value;
          return (
            <button
              key={filter.label}
              type="button"
              aria-pressed={active}
              onClick={() =>
                go({
                  ...search,
                  status: filter.value,
                  page: 1,
                })
              }
              className={cn(
                "h-8 cursor-pointer px-3 text-xs font-medium transition-colors duration-150",
                active
                  ? "bg-navy text-white"
                  : "border border-border bg-background text-muted hover:border-navy hover:text-navy",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <form
        className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          go({
            ...search,
            reference: reference.trim() || undefined,
            sender_phone: senderPhone.trim() || undefined,
            recipient_phone: recipientPhone.trim() || undefined,
            page: 1,
          });
        }}
      >
        <Input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          name="reference"
          placeholder="Reference"
          aria-label="Reference"
          className="h-9"
        />
        <Input
          value={senderPhone}
          onChange={(event) => setSenderPhone(event.target.value)}
          name="sender_phone"
          placeholder="Sender phone"
          aria-label="Sender phone"
          inputMode="tel"
          autoComplete="off"
          className="h-9"
        />
        <Input
          value={recipientPhone}
          onChange={(event) => setRecipientPhone(event.target.value)}
          name="recipient_phone"
          placeholder="Recipient phone"
          aria-label="Recipient phone"
          inputMode="tel"
          autoComplete="off"
          className="h-9"
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="h-9">
            Find
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => {
              setReference("");
              setSenderPhone("");
              setRecipientPhone("");
              go({});
            }}
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
}
