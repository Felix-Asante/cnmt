"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("PageError");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-navy">{t("title")}</h1>
      <p className="text-[15px] leading-relaxed text-muted">
        {t("description")}
      </p>
      <Button onClick={reset}>{t("retry")}</Button>
    </section>
  );
}
