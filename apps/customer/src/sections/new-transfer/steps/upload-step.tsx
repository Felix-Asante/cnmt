"use client";

import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { InformationBanner } from "@repo/ui/information-banner";
import { UploadArea } from "@repo/ui/upload-area";
import { PAYMENT_PROOF_UPLOAD } from "@repo/utils/file";
import type { TransferFormValues } from "../schema";
import { useWatch } from "react-hook-form";

type UploadStepProps = {
  form: UseFormReturn<TransferFormValues>;
  disabled?: boolean;
};

export function UploadStep({ form, disabled = false }: UploadStepProps) {
  const t = useTranslations("NewTransfer.Upload");
  const tValidation = useTranslations("NewTransfer.Validation");
  const file = useWatch({ control: form.control, name: "proofFile" });
  const error = form.formState.errors.proofFile?.message;

  return (
    <div className="space-y-8">
      <header className="max-w-lg space-y-2">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
          {t("title")}
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          {t("description")}
        </p>
      </header>

      <InformationBanner tone="warning" title={t("detailsTitle")}>
        {t("detailsBody")}
      </InformationBanner>

      <UploadArea
        value={file instanceof File ? file : null}
        disabled={disabled}
        rules={{
          ...PAYMENT_PROOF_UPLOAD,
          requiredMessage: tValidation("proofRequired"),
          typeMessage: tValidation("proofType"),
          sizeMessage: tValidation("proofSize"),
        }}
        helperText={t("helperText")}
        dropLabel={t("dropLabel")}
        previewAlt={t("previewAlt")}
        onChange={(next) =>
          form.setValue("proofFile", next, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
        error={typeof error === "string" ? error : undefined}
      />
    </div>
  );
}
