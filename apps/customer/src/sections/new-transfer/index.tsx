"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Stepper } from "@repo/ui/stepper";
import { toast } from "@repo/ui/toast";
import { TransferSummary } from "@repo/ui/transfer-summary";
import {
  FULFILLMENT_STEP_IDS,
  REQUEST_STEP_IDS,
  firstDestinationForSource,
  getChannelExtraFee,
  getRecipientCountry,
  getSenderCountry,
  getTransferQuote,
  resolveTransferFee,
} from "./constants";
import { formatMoney } from "@repo/utils/money";
import { itemName } from "@repo/utils/lookup";
import { formatPromoDiscount } from "@/utils/transfer";
import { Link, useRouter } from "@/i18n/navigation";
import { rememberCorridor, rememberRecipient } from "./memory";
import {
  createProofSchema,
  createTransferRequestSchema,
  defaultTransferValues,
  stepFieldMap,
  type TransferFormValues,
  type ValidationMessageKey,
} from "./schema";
import { PaymentStep } from "./steps/payment-step";
import { RecipientStep } from "./steps/recipient-step";
import { SuccessStep } from "./steps/success-step";
import { TransferStep } from "./steps/transfer-step";
import { UploadStep } from "./steps/upload-step";
import type { PreviewPromoCode, TransferOptions } from "@repo/types";
import {
  confirmPaymentProofUploaded,
  createTransfer,
  createUploadPaymentProofSignedUrl,
  previewPromoCode,
} from "./api/server";
import {
  normalizeMimeType,
  PAYMENT_PROOF_UPLOAD,
  validateFile,
} from "@repo/utils/file";

const stepMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
};

export type ResumePayment = {
  reference: string;
  sendAmount: string;
  sendCurrency: string;
  senderCountryCode: string;
};

type NewTransferProps = {
  transferOptions: TransferOptions;
  resume?: ResumePayment;
};

type PendingAction = "submit" | "upload" | null;

export default function NewTransfer({
  transferOptions,
  resume,
}: NewTransferProps) {
  const t = useTranslations("NewTransfer");
  const tValidation = useTranslations("NewTransfer.Validation");
  const tErrors = useTranslations("NewTransfer.Errors");
  const router = useRouter();

  const translateValidation = (key: ValidationMessageKey) => tValidation(key);

  const [step, setStep] = useState(resume ? 3 : 0);
  const [reference, setReference] = useState(resume?.reference ?? "");
  const [paymentAccountId, setPaymentAccountId] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PreviewPromoCode | null>(
    null,
  );
  const [promoError, setPromoError] = useState<string | undefined>();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const pendingActionRef = useRef<PendingAction>(null);
  const busy = pendingAction !== null;

  const firstSenderCountry = transferOptions.sources[0];
  const firstDestination = firstSenderCountry
    ? firstDestinationForSource(
        firstSenderCountry.id.toString(),
        transferOptions.destinations,
      )
    : undefined;

  const form = useForm<TransferFormValues>({
    resolver: (values, context, options) =>
      zodResolver(createTransferRequestSchema(translateValidation))(
        values,
        context,
        options,
      ),
    defaultValues: {
      ...defaultTransferValues,
      senderCountryCode:
        resume?.senderCountryCode ?? firstSenderCountry?.id.toString() ?? "",
      recipientCountryCode: firstDestination?.id.toString() ?? "",
      sendAmount: resume?.sendAmount ?? "",
      sendCurrency:
        resume?.sendCurrency ?? firstSenderCountry?.currency_code ?? "GBP",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const values = useWatch({ control: form.control });
  const sender = getSenderCountry(
    values.senderCountryCode ?? "",
    transferOptions.sources,
  );
  const recipient = getRecipientCountry(
    values.recipientCountryCode ?? "",
    values.senderCountryCode ?? "",
    transferOptions.destinations,
  );
  const selectedChannelId =
    values.receivingMethod === "bank" ? values.bank : values.network;
  const selectedChannels =
    values.receivingMethod === "bank"
      ? recipient?.banks
      : recipient?.mobile_networks;
  const extraFee = getChannelExtraFee(selectedChannels, selectedChannelId);
  const fee = resolveTransferFee({
    amount: Number(values.sendAmount ?? 0),
    feeType: recipient?.fee_type ?? "fixed",
    fee: Number(recipient?.fee ?? 0),
    extraFee,
    promoDiscountPercentage: appliedPromo?.discount_percentage,
  });
  const quote = getTransferQuote(
    values.sendAmount ?? "",
    values.sendCurrency ?? "",
    recipient?.currency_code ?? "GHS",
    Number(recipient?.default_exchange_rate ?? 1),
    fee,
  );

  const inRequestPhase = !resume && step <= 1;
  const isSubmittedScreen = step === 2;
  const isCompleteScreen = step === 5;
  const showFooter = step === 0 || step === 1 || step === 3 || step === 4;
  const showSummary = step <= 4 && !isSubmittedScreen;

  const stepperSteps = (
    inRequestPhase ? REQUEST_STEP_IDS : FULFILLMENT_STEP_IDS
  ).map((id) => ({ id, label: t(`steps.${id}`) }));
  const stepperIndex = inRequestPhase
    ? step
    : step === 2
      ? 0
      : Math.max(step - 3, 0);

  const summaryItems = useMemo(() => {
    const channelNameValue =
      values.receivingMethod === "mobile_money"
        ? itemName(recipient?.mobile_networks ?? [], values.network)
        : itemName(recipient?.banks ?? [], values.bank);
    const payoutDetail =
      values.receivingMethod === "mobile_money"
        ? channelNameValue || t("summary.mobileMoney")
        : [channelNameValue, values.bankAccountNumber]
            .filter(Boolean)
            .join(" · ") || t("summary.bankTransfer");

    return [
      {
        label: t("summary.from"),
        value: sender ? `${sender.flag} ${sender.name}` : "—",
      },
      {
        label: t("summary.to"),
        value: recipient ? `${recipient.flag} ${recipient.name}` : "—",
      },
      {
        label: t("summary.recipient"),
        value: values.recipientName?.trim() || "—",
      },
      {
        label: t("summary.payout"),
        value: payoutDetail,
      },
      ...(appliedPromo
        ? [
            {
              label: t("summary.promo"),
              value: t("summary.promoValue", {
                code: appliedPromo.code,
                discount: formatPromoDiscount(appliedPromo.discount_percentage),
              }),
            },
          ]
        : []),
      ...(extraFee > 0
        ? [
            {
              label: t("summary.extraFee"),
              value: `+${formatMoney(extraFee, recipient?.currency_code ?? "")}`,
            },
          ]
        : []),
      { label: t("summary.youSend"), value: quote.sendLabel, emphasis: true },
      {
        label: t("summary.recipientGets"),
        value: quote.receiveLabel,
        emphasis: true,
      },
      { label: t("summary.rate"), value: recipient?.default_exchange_rate ?? "" },
    ];
  }, [appliedPromo, extraFee, quote, recipient, sender, t, values]);

  async function handleApplyPromo(code: string) {
    setPromoError(undefined);
    const result = await previewPromoCode(code);
    if (!result.ok) {
      setAppliedPromo(null);
      setPromoError(result.error);
      return result.error;
    }

    setAppliedPromo(result.promo);
    form.setValue("promoCode", result.promo.code, {
      shouldDirty: true,
      shouldValidate: true,
    });
    return null;
  }

  function handleClearPromo() {
    setAppliedPromo(null);
    setPromoError(undefined);
    form.setValue("promoCode", "", { shouldDirty: true });
  }

  function amountRangeError(amount: number, currency: string) {
    const min = Number(recipient?.min_transfer_amount);
    const max = Number(recipient?.max_transfer_amount);
    if (!Number.isFinite(amount)) return tValidation("sendAmountInvalid");
    if (Number.isFinite(min) && min > 0 && amount < min) {
      return tValidation("amountMin", {
        amount: formatMoney(min, currency),
      });
    }
    if (Number.isFinite(max) && max > 0 && amount > max) {
      return tValidation("amountMax", {
        amount: formatMoney(max, currency),
      });
    }
    return null;
  }

  async function goNext() {
    if (busy || pendingActionRef.current) return;
    const fields = stepFieldMap[step];
    if (!fields) return;

    if (step === 4) {
      const proofFile = form.getValues("proofFile");
      const proofValid = createProofSchema(translateValidation).safeParse({
        proofFile,
      });
      if (!proofValid.success) {
        form.setError("proofFile", {
          message: proofValid.error.issues[0]?.message,
        });
        return;
      }
      await uploadProof(proofFile);
      return;
    }

    const valid = await form.trigger([...fields]);
    if (!valid) return;

    if (step === 0) {
      const amount = Number(form.getValues("sendAmount"));
      const rangeMessage = amountRangeError(
        amount,
        form.getValues("sendCurrency"),
      );
      if (rangeMessage) {
        form.setError("sendAmount", { message: rangeMessage });
        return;
      }
    }

    if (step === 1) {
      await submitRequest();
      return;
    }

    setStep((current) => current + 1);
  }

  async function uploadProof(proofFile: File | null) {
    if (pendingActionRef.current) return;
    const message = validateFile(proofFile, {
      ...PAYMENT_PROOF_UPLOAD,
      requiredMessage: tValidation("proofRequired"),
      typeMessage: tValidation("proofType"),
      sizeMessage: tValidation("proofSize"),
    });
    if (message || !proofFile) {
      toast.error(tErrors("proofMissingTitle"), {
        description: message ?? tErrors("proofMissingDescription"),
      });
      return;
    }
    if (!reference) {
      toast.error(tErrors("missingReferenceTitle"), {
        description: tErrors("missingReferenceDescription"),
      });
      return;
    }
    if (!paymentAccountId) {
      toast.error(tErrors("selectAccountTitle"), {
        description: tErrors("selectAccountDescription"),
      });
      return;
    }

    pendingActionRef.current = "upload";
    setPendingAction("upload");
    try {
      const contentType = normalizeMimeType(proofFile.type);
      const signed = await createUploadPaymentProofSignedUrl(
        reference,
        contentType,
      );
      if (!signed) {
        toast.error(tErrors("uploadFailedTitle"), {
          description: tErrors("uploadFailedDescription"),
        });
        return;
      }

      const uploaded = await fetch(signed.signed_url, {
        method: "PUT",
        body: proofFile,
        headers: { "Content-Type": signed.content_type },
        credentials: "omit",
      });

      if (!uploaded.ok) {
        toast.error(tErrors("uploadFailedTitle"), {
          description: tErrors("uploadFileFailedDescription"),
        });
        return;
      }

      const confirmed = await confirmPaymentProofUploaded(
        reference,
        signed.key,
        paymentAccountId,
      );
      if (!confirmed) {
        toast.error(tErrors("confirmFailedTitle"), {
          description: tErrors("confirmFailedDescription"),
        });
        return;
      }

      setStep(5);
    } catch (error) {
      console.error("Error uploading proof:", error);
      toast.error(tErrors("uploadFailedTitle"), {
        description: tErrors("uploadFailedDescription"),
      });
    } finally {
      pendingActionRef.current = null;
      setPendingAction(null);
    }
  }

  async function submitRequest() {
    if (pendingActionRef.current) return;
    const valid = await form.trigger();
    if (!valid) return;

    const { proofFile: _proofFile, ...requestValues } = form.getValues();
    idempotencyKeyRef.current ??= crypto.randomUUID();
    pendingActionRef.current = "submit";
    setPendingAction("submit");

    try {
      const response = await createTransfer(
        {
          ...requestValues,
          promoCode: appliedPromo?.code ?? "",
        },
        idempotencyKeyRef.current,
      );
      if (!response) {
        toast.error(tErrors("submitFailedTitle"), {
          description: tErrors("submitFailedDescription"),
        });
        return;
      }
      idempotencyKeyRef.current = null;

      rememberCorridor({
        senderCountryCode: requestValues.senderCountryCode,
        recipientCountryCode: requestValues.recipientCountryCode,
      });
      rememberRecipient({
        name: requestValues.recipientName,
        phone: requestValues.recipientPhone,
        receivingMethod: requestValues.receivingMethod,
        network: requestValues.network,
        bank: requestValues.bank,
        bankAccountName: requestValues.bankAccountName,
        bankAccountNumber: requestValues.bankAccountNumber,
        senderCountryCode: requestValues.senderCountryCode,
        recipientCountryCode: requestValues.recipientCountryCode,
        sendCurrency: requestValues.sendCurrency,
      });
      setReference(response.reference);
      setStep(2);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(tErrors("submitFailedTitle"), {
        description: tErrors("submitUnexpectedDescription"),
      });
    } finally {
      pendingActionRef.current = null;
      setPendingAction(null);
    }
  }

  function goBack() {
    if (busy || pendingActionRef.current) return;
    if (step === 3) {
      setStep(2);
      return;
    }
    setStep((current) => Math.max(current - 1, 0));
  }

  function handleCreateAnother() {
    idempotencyKeyRef.current = null;
    form.reset({
      ...defaultTransferValues,
      senderCountryCode: firstSenderCountry?.id.toString() ?? "",
      recipientCountryCode: firstDestination?.id.toString() ?? "",
      sendCurrency: firstSenderCountry?.currency_code ?? "GBP",
    });
    setReference("");
    setPaymentAccountId("");
    setAppliedPromo(null);
    setPromoError(undefined);
    setStep(0);
    if (resume) {
      router.replace("/transfer");
    }
  }

  if (!transferOptions.sources.length) {
    return (
      <main className="min-h-full bg-[#f7f8fa]">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy">
            {t("unavailable.title")}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            {t("unavailable.description")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-270 px-4 py-8 sm:px-6 md:py-12">
        {!isSubmittedScreen && !isCompleteScreen ? (
          <div className="mb-10">
            <Stepper steps={stepperSteps} currentStep={stepperIndex} />
          </div>
        ) : null}

        <div
          className={
            showSummary
              ? "grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
              : "mx-auto max-w-2xl"
          }
        >
          <section className="bg-background px-5 py-7 sm:px-8 sm:py-9 md:px-10 md:py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={stepMotion.initial}
                animate={stepMotion.animate}
                exit={stepMotion.exit}
                transition={stepMotion.transition}
              >
                <fieldset disabled={busy} className="min-w-0 border-0 p-0">
                  {step === 0 ? (
                    <TransferStep
                      form={form}
                      transferOptions={transferOptions}
                    />
                  ) : null}
                  {step === 1 ? (
                    <RecipientStep
                      form={form}
                      transferOptions={transferOptions}
                      appliedPromo={appliedPromo}
                      promoError={promoError}
                      onApplyPromo={handleApplyPromo}
                      onClearPromo={handleClearPromo}
                    />
                  ) : null}
                  {step === 2 ? (
                    <SuccessStep
                      variant="submitted"
                      reference={reference}
                      onPayNow={() => {
                        if (reference) setStep(3);
                      }}
                      onCreateAnother={handleCreateAnother}
                    />
                  ) : null}
                  {step === 3 ? (
                    <PaymentStep
                      form={form}
                      reference={reference}
                      selectedAccountId={paymentAccountId}
                      onSelectAccount={setPaymentAccountId}
                    />
                  ) : null}
                  {step === 4 ? (
                    <UploadStep form={form} disabled={busy} />
                  ) : null}
                  {step === 5 ? (
                    <SuccessStep
                      variant="complete"
                      reference={reference}
                      onCreateAnother={handleCreateAnother}
                    />
                  ) : null}
                </fieldset>
              </motion.div>
            </AnimatePresence>

            {showFooter ? (
              <div className="mt-12 flex items-center justify-between gap-3">
                {resume && step === 3 ? (
                  <Button asChild variant="ghost">
                    <Link href={`/track?ref=${encodeURIComponent(reference)}`}>
                      <ArrowLeft className="size-4" aria-hidden />
                      {t("actions.back")}
                    </Link>
                  </Button>
                ) : step > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={goBack}
                    disabled={busy}
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    {t("actions.back")}
                  </Button>
                ) : (
                  <span />
                )}

                {step === 0 ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={goNext}
                    disabled={busy}
                  >
                    {t("actions.continue")}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                ) : null}

                {step === 1 ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={goNext}
                    loading={pendingAction === "submit"}
                    disabled={busy}
                  >
                    {pendingAction === "submit"
                      ? t("actions.submitting")
                      : t("actions.submit")}
                  </Button>
                ) : null}

                {step === 3 ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      if (!paymentAccountId) {
                        toast.error(tErrors("selectAccountTitle"), {
                          description: tErrors("selectAccountBeforeContinue"),
                        });
                        return;
                      }
                      setStep(4);
                    }}
                    disabled={busy || !reference || !paymentAccountId}
                  >
                    {t("actions.ivePaid")}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                ) : null}

                {step === 4 ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={goNext}
                    loading={pendingAction === "upload"}
                    disabled={busy}
                  >
                    {pendingAction === "upload"
                      ? t("actions.uploading")
                      : t("actions.finish")}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </section>

          {showSummary ? (
            <TransferSummary
              className="lg:sticky lg:top-8"
              items={summaryItems}
              receiveHighlight={quote.receiveLabel}
              estimatedCompletion={t("summary.estimatedCompletion")}
              feesIncludedText={(() => {
                const notes = [
                  appliedPromo
                    ? t("summary.promoOffFee", {
                        discount: formatPromoDiscount(
                          appliedPromo.discount_percentage,
                        ),
                      })
                    : null,
                  extraFee > 0
                    ? t("summary.extraFeeNote", {
                        amount: formatMoney(
                          extraFee,
                          recipient?.currency_code ?? "",
                        ),
                      })
                    : null,
                ].filter(Boolean);
                return notes.length
                  ? t("summary.feesIncluded", { notes: notes.join(" · ") })
                  : undefined;
              })()}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
