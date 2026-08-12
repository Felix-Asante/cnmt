"use client";

import type { ComponentProps } from "react";
import {
  CircleAlert,
  CircleCheck,
  Info,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { Toaster as Sonner, toast } from "sonner";
import { cn } from "./utils";

type ToasterProps = ComponentProps<typeof Sonner>;

export function Toaster({ className, toastOptions, ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      closeButton
      duration={4500}
      visibleToasts={4}
      offset={16}
      gap={10}
      className={cn("toaster", className)}
      icons={{
        success: <CircleCheck className="size-4" aria-hidden />,
        error: <CircleAlert className="size-4" aria-hidden />,
        warning: <TriangleAlert className="size-4" aria-hidden />,
        info: <Info className="size-4" aria-hidden />,
        loading: (
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
        ),
      }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast: cn(
            "group !w-[min(22.5rem,calc(100vw-2rem))] !rounded-none !border !border-border !bg-background !p-4 !font-sans !text-foreground !shadow-md",
            "[&>[data-icon]]:!text-navy [&>[data-icon]]:mt-0.5",
          ),
          title: "!text-sm !font-medium !text-navy",
          description: "!text-sm !leading-relaxed !text-muted",
          actionButton:
            "!h-8 !rounded-none !bg-navy !px-3 !text-xs !font-medium !text-white hover:!bg-navy-hover",
          cancelButton:
            "!h-8 !rounded-none !border !border-border !bg-transparent !px-3 !text-xs !font-medium !text-muted hover:!bg-surface hover:!text-foreground",
          closeButton:
            "!border-border !bg-background !text-subtle hover:!border-navy hover:!bg-surface hover:!text-navy",
          success:
            "!border-border !bg-success-soft [&>[data-icon]]:!text-success",
          error: "!border-border !bg-brand-soft [&>[data-icon]]:!text-brand",
          warning: "!border-border !bg-gold-soft [&>[data-icon]]:!text-warning",
          info: "!border-border !bg-navy-soft [&>[data-icon]]:!text-navy",
          loading: "!border-border !bg-surface [&>[data-icon]]:!text-navy",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
}

export { toast };
export type { ToasterProps };
