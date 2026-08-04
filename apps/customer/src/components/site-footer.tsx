import Link from "next/link";
import { SUPPORT } from "@/constants/support";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-xs font-bold tracking-[0.14em] text-navy uppercase">
            C.N Connect
          </p>
          <p className="mt-1 text-xs text-muted">
            Support {SUPPORT.hours}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <a
            href={SUPPORT.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted no-underline transition-colors hover:text-navy"
          >
            WhatsApp
          </a>
          <a
            href={SUPPORT.phoneHref}
            className="text-muted no-underline transition-colors hover:text-navy"
          >
            {SUPPORT.phoneDisplay}
          </a>
          <a
            href={SUPPORT.phoneSecondaryHref}
            className="text-muted no-underline transition-colors hover:text-navy"
          >
            {SUPPORT.phoneSecondaryDisplay}
          </a>
          <a
            href={SUPPORT.emailHref}
            className="text-muted no-underline transition-colors hover:text-navy"
          >
            Email
          </a>
          <a
            href={SUPPORT.reportIssueHref}
            className="text-muted no-underline transition-colors hover:text-navy"
          >
            Report issue
          </a>
          <a
            href={SUPPORT.featureRequestHref}
            className="text-muted no-underline transition-colors hover:text-navy"
          >
            Request feature
          </a>
          <Link
            href="/transfer"
            className="font-medium text-navy no-underline transition-colors hover:text-brand"
          >
            Send money
          </Link>
        </div>
      </div>
    </footer>
  );
}
