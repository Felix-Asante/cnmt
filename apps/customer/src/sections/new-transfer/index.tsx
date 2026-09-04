"use client";

import { useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Stepper } from "@repo/ui/stepper";
import { toast } from "@repo/ui/toast";
import { TransferSummary } from "@repo/ui/transfer-summary";
import {
  FULFILLMENT_STEPS,
  REQUEST_STEPS,
  STATIC_QUOTE,
  calculateFee,
  firstDestinationForSource,
  getRecipientCountry,
  getSenderCountry,
  getTransferQuote,
} from "./constants";
import { amountOutOfRangeMessage } from "@repo/utils/money";
import { itemName } from "@repo/utils/lookup";
import { rememberCorridor, rememberRecipient } from "./memory";
import {
  defaultTransferValues,
  proofSchema,
  stepFieldMap,
  transferRequestSchema,
  type TransferFormValues,
} from "./schema";
import { PaymentStep } from "./steps/payment-step";
import { RecipientStep } from "./steps/recipient-step";
import { SuccessStep } from "./steps/success-step";
import { TransferStep } from "./steps/transfer-step";
import { UploadStep } from "./steps/upload-step";
import type { TransferOptions } from "@repo/types";
import {
  confirmPaymentProofUploaded,
  createTransfer,
  createUploadPaymentProofSignedUrl,
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

type NewTransferProps = {
  transferOptions: TransferOptions;
};

type PendingAction = "submit" | "upload" | null;

export default function NewTransfer({ transferOptions }: NewTransferProps) {
  const [step, setStep] = useState(0);
  const [reference, setReference] = useState("");
  const [paymentAccountId, setPaymentAccountId] = useState("");
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
    resolver: zodResolver(transferRequestSchema),
    defaultValues: {
      ...defaultTransferValues,
      senderCountryCode: firstSenderCountry?.id.toString() ?? "",
      recipientCountryCode: firstDestination?.id.toString() ?? "",
      sendCurrency: firstSenderCountry?.currency_code ?? "GBP",
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
    transferOptions.destinations,
  );
  const fee = calculateFee(
    Number(values.sendAmount ?? 0),
    recipient?.fee_type ?? "fixed",
    Number(recipient?.fee ?? 0),
  );
  const quote = getTransferQuote(
    values.sendAmount ?? "",
    values.sendCurrency ?? "",
    recipient?.currency_code ?? "GHS",
    Number(recipient?.default_exchange_rate ?? 1),
    fee,
  );

  const inRequestPhase = step <= 1;
  const isSubmittedScreen = step === 2;
  const isCompleteScreen = step === 5;
  const showFooter = step === 0 || step === 1 || step === 3 || step === 4;
  const showSummary = step <= 4 && !isSubmittedScreen;

  const stepperSteps = inRequestPhase
    ? [...REQUEST_STEPS]
    : [...FULFILLMENT_STEPS];
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
        ? channelNameValue || "Mobile money"
        : [channelNameValue, values.bankAccountNumber]
            .filter(Boolean)
            .join(" · ") || "Bank transfer";

    return [
      {
        label: "From",
        value: sender ? `${sender.flag} ${sender.name}` : "—",
      },
      {
        label: "To",
        value: recipient ? `${recipient.flag} ${recipient.name}` : "—",
      },
      {
        label: "Recipient",
        value: values.recipientName?.trim() || "—",
      },
      {
        label: "Payout",
        value: payoutDetail,
      },
      { label: "You send", value: quote.sendLabel, emphasis: true },
      { label: "Recipient gets", value: quote.receiveLabel, emphasis: true },
      {
        label: "Fee",
        value: `${sender?.currency_symbol} ${fee.toFixed(2)}`,
        emphasis: false,
      },
      { label: "Rate", value: recipient?.default_exchange_rate ?? "" },
    ];
  }, [quote, recipient, sender, values]);

  async function goNext() {
    if (busy || pendingActionRef.current) return;
    const fields = stepFieldMap[step];
    if (!fields) return;

    if (step === 4) {
      const proofFile = form.getValues("proofFile");
      const proofValid = proofSchema.safeParse({ proofFile });
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
      const rangeMessage = amountOutOfRangeMessage(
        amount,
        Number(recipient?.min_transfer_amount),
        Number(recipient?.max_transfer_amount),
        form.getValues("sendCurrency"),
        "transfer",
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
    const message = validateFile(proofFile, PAYMENT_PROOF_UPLOAD);
    if (message || !proofFile) {
      toast.error("No proof file provided", {
        description: message ?? "Please select a proof file to upload.",
      });
      return;
    }
    if (!reference) {
      toast.error("Missing transfer reference", {
        description: "Go back and submit the transfer first.",
      });
      return;
    }
    if (!paymentAccountId) {
      toast.error("Select a payment account", {
        description: "Go back and choose the account you paid to.",
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
        toast.error("We couldn’t upload the proof", {
          description: "Check the details and try again.",
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
        toast.error("We couldn’t upload the proof", {
          description: "Check the file and try again.",
        });
        return;
      }

      const confirmed = await confirmPaymentProofUploaded(
        reference,
        signed.key,
        paymentAccountId,
      );
      if (!confirmed) {
        toast.error("We couldn’t confirm the proof", {
          description: "The file uploaded, but confirmation failed. Try again.",
        });
        return;
      }

      setStep(5);
    } catch (error) {
      console.error("Error uploading proof:", error);
      toast.error("We couldn’t upload the proof", {
        description: "Check the details and try again.",
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
        requestValues,
        idempotencyKeyRef.current,
      );
      if (!response) {
        toast.error("We couldn’t submit this transfer", {
          description: "Check the details and try again.",
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
      toast.error("We couldn’t submit this transfer", {
        description: "Something went wrong. Please try again.",
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
    setStep(0);
  }

  if (!transferOptions.sources.length) {
    return (
      <main className="min-h-full bg-[#f7f8fa]">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy">
            Transfers unavailable
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            We couldn’t load sending options right now. Please try again
            shortly.
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
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={goBack}
                    disabled={busy}
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    Back
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
                    Continue
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
                      ? "Submitting…"
                      : "Submit request"}
                  </Button>
                ) : null}

                {step === 3 ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      if (!paymentAccountId) {
                        toast.error("Select a payment account", {
                          description:
                            "Choose the bank or mobile money account you will pay to.",
                        });
                        return;
                      }
                      setStep(4);
                    }}
                    disabled={busy || !reference || !paymentAccountId}
                  >
                    I’ve paid
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
                    {pendingAction === "upload" ? "Uploading…" : "Finish"}
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
              estimatedCompletion={STATIC_QUOTE.estimatedCompletion}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
