"use client";

import { useTranslations } from "next-intl";
import { SUPPORT } from "@/constants/support";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("Footer");
  const tBrand = useTranslations("Brand");
  const tSupport = useTranslations("Support");

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-280 flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-xs font-bold tracking-[0.14em] text-navy uppercase">
            {tBrand("name")}
          </p>
          <p className="mt-1 text-xs text-muted">
            {t("support", { hours: tSupport("hours") })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <a
            href={SUPPORT.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted no-underline transition-colors hover:text-navy"
          >
            {t("whatsapp")}
          </a>
          <a
            href={SUPPORT.phoneSecondaryHref}
            className="text-muted no-underline transition-colors hover:text-navy"
          >
            {SUPPORT.phoneSecondaryDisplay}
          </a>
          <a
            href={SUPPORT.phoneHref}
            className="text-muted no-underline transition-colors hover:text-navy"
          >
            {SUPPORT.phoneDisplay}
          </a>
          <a
            href={SUPPORT.emailHref}
            className="text-muted no-underline transition-colors hover:text-navy"
          >
            {t("email")}
          </a>
          <a
            href={SUPPORT.reportIssueHref}
            className="text-muted no-underline transition-colors hover:text-navy"
          >
            {t("reportIssue")}
          </a>
          <a
            href={SUPPORT.featureRequestHref}
            className="text-muted no-underline transition-colors hover:text-navy"
          >
            {t("requestFeature")}
          </a>
          <Link
            href="/transfer"
            className="font-medium text-navy no-underline transition-colors hover:text-brand"
          >
            {t("sendMoney")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
