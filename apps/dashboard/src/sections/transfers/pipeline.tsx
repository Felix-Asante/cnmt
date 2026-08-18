import type { TransferStatus } from "@repo/types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TRANSFER_PIPELINE,
  TRANSFER_PIPELINE_SHORT,
  isPipelineStatus,
} from "./constants";

export function TransferPipeline({ status }: { status: TransferStatus }) {
  const halted = !isPipelineStatus(status);
  const currentIndex = halted ? -1 : TRANSFER_PIPELINE.indexOf(status);

  return (
    <ol className="grid grid-cols-5 gap-px bg-border" aria-label="Transfer progress">
      {TRANSFER_PIPELINE.map((step, index) => {
        const complete = !halted && index < currentIndex;
        const current = !halted && index === currentIndex;
        const label = TRANSFER_PIPELINE_SHORT[step];

        return (
          <li
            key={step}
            aria-current={current ? "step" : undefined}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 px-1 py-2 text-center",
              halted
                ? "bg-surface text-subtle"
                : complete
                  ? "bg-navy-soft text-navy"
                  : current
                    ? "bg-navy text-white"
                    : "bg-background text-subtle",
            )}
          >
            <span className="flex size-4 items-center justify-center">
              {complete ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    current ? "bg-white" : "bg-current",
                  )}
                  aria-hidden
                />
              )}
            </span>
            <span className="text-[11px] font-medium tracking-wide">
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
