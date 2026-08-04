"use client";

import type { UseFormReturn } from "react-hook-form";
import { InformationBanner } from "@repo/ui/information-banner";
import { UploadArea } from "@repo/ui/upload-area";
import type { TransferFormValues } from "../schema";

type UploadStepProps = {
  form: UseFormReturn<TransferFormValues>;
};

export function UploadStep({ form }: UploadStepProps) {
  const file = form.watch("proofFile");
  const error = form.formState.errors.proofFile?.message;

  return (
    <div className="space-y-8">
      <header className="max-w-lg space-y-2">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
          Upload payment proof
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          A clear screenshot or PDF of the confirmation helps us verify without
          delay.
        </p>
      </header>

      <InformationBanner tone="warning" title="Include these details">
        Amount, date, and your payment reference should be visible.
      </InformationBanner>

      <UploadArea
        value={file instanceof File ? file : null}
        onChange={(next) =>
          form.setValue("proofFile", next as File, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
        error={typeof error === "string" ? error : undefined}
      />
    </div>
  );
}
