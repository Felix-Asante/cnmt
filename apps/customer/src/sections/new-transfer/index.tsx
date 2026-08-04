"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Stepper } from "@repo/ui/stepper";
import { TransferSummary } from "@repo/ui/transfer-summary";
import {
  FULFILLMENT_STEPS,
  REQUEST_STEPS,
  STATIC_QUOTE,
  createReferenceNumber,
  getRecipientCountry,
  getSenderCountry,
  getTransferQuote,
} from "./constants";
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

const stepMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
};

/**
 * 0 Transfer · 1 Recipient · 2 Submitted · 3 Pay · 4 Proof · 5 Done
 */
export default function NewTransfer() {
  const [step, setStep] = useState(0);
  const [reference, setReference] = useState(() => createReferenceNumber());
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferRequestSchema),
    defaultValues: defaultTransferValues,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const values = form.watch();
  const sender = getSenderCountry(values.senderCountryCode);
  const recipient = getRecipientCountry(values.recipientCountryCode);
  const quote = getTransferQuote(
    values.sendAmount,
    values.sendCurrency,
    recipient?.receiveCurrency ?? "GHS",
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

  const summaryItems = useMemo(
    () => [
      {
        label: "From",
        value: sender ? `${sender.flag} ${sender.name}` : "—",
      },
      {
        label: "To",
        value: recipient ? `${recipient.flag} ${recipient.name}` : "—",
      },
      { label: "You send", value: quote.sendLabel, emphasis: true },
      { label: "Recipient gets", value: quote.receiveLabel, emphasis: true },
      { label: "Fee", value: quote.feeLabel },
      { label: "Rate", value: quote.rateLabel },
    ],
    [quote, recipient, sender],
  );

  async function goNext() {
    const fields = stepFieldMap[step];
    if (!fields) return;

    if (step === 4) {
      const proofValid = proofSchema.safeParse({
        proofFile: form.getValues("proofFile"),
      });
      if (!proofValid.success) {
        form.setError("proofFile", {
          message: proofValid.error.issues[0]?.message,
        });
        return;
      }
      console.log({ ...form.getValues(), reference, proofUploaded: true });
      setStep(5);
      return;
    }

    const valid = await form.trigger([...fields]);
    if (!valid) return;

    if (step === 1) {
      await submitRequest();
      return;
    }

    setStep((current) => current + 1);
  }

  async function submitRequest() {
    const valid = await form.trigger();
    if (!valid) return;

    setSubmitting(true);
    const data = form.getValues();
    console.log({ ...data, reference, status: "request_submitted" });

    rememberCorridor({
      senderCountryCode: data.senderCountryCode,
      recipientCountryCode: data.recipientCountryCode,
    });
    rememberRecipient({
      name: data.recipientName,
      phone: data.recipientPhone,
      receivingMethod: data.receivingMethod,
      network: data.network,
      bank: data.bank,
      senderCountryCode: data.senderCountryCode,
      recipientCountryCode: data.recipientCountryCode,
      sendCurrency: data.sendCurrency,
    });

    setSubmitting(false);
    setStep(2);
  }

  function goBack() {
    if (step === 3) {
      setStep(2);
      return;
    }
    setStep((current) => Math.max(current - 1, 0));
  }

  function handleCreateAnother() {
    form.reset(defaultTransferValues);
    setReference(createReferenceNumber());
    setStep(0);
  }

  return (
    <main className="min-h-full bg-[#f7f8fa]">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-[1080px] items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="font-display text-sm font-bold tracking-[0.14em] text-brand uppercase no-underline"
          >
            C.N Connect
          </Link>
          <p className="text-xs text-muted">
            {inRequestPhase || isSubmittedScreen
              ? "New transfer"
              : "Complete payment"}
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1080px] px-4 py-8 sm:px-6 md:py-12">
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
                {step === 0 ? <TransferStep form={form} /> : null}
                {step === 1 ? <RecipientStep form={form} /> : null}
                {step === 2 ? (
                  <SuccessStep
                    variant="submitted"
                    reference={reference}
                    onPayNow={() => setStep(3)}
                    onCreateAnother={handleCreateAnother}
                  />
                ) : null}
                {step === 3 ? (
                  <PaymentStep form={form} reference={reference} />
                ) : null}
                {step === 4 ? <UploadStep form={form} /> : null}
                {step === 5 ? (
                  <SuccessStep
                    variant="complete"
                    reference={reference}
                    onCreateAnother={handleCreateAnother}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>

            {showFooter ? (
              <div className="mt-12 flex items-center justify-between gap-3 border-t border-border pt-6">
                {step > 0 ? (
                  <Button type="button" variant="ghost" onClick={goBack}>
                    <ArrowLeft className="size-4" aria-hidden />
                    Back
                  </Button>
                ) : (
                  <span />
                )}

                {step === 0 ? (
                  <Button type="button" size="lg" onClick={goNext}>
                    Continue
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                ) : null}

                {step === 1 ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={goNext}
                    disabled={submitting}
                  >
                    Submit request
                  </Button>
                ) : null}

                {step === 3 ? (
                  <Button type="button" size="lg" onClick={() => setStep(4)}>
                    I’ve paid
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                ) : null}

                {step === 4 ? (
                  <Button type="button" size="lg" onClick={goNext}>
                    Finish
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
