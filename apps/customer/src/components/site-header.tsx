"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ComponentType } from "react";
import {
  Bug,
  ChevronDown,
  Lightbulb,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORT } from "@/constants/support";

function getContextLabel(pathname: string) {
  if (pathname.startsWith("/transfer")) return "New transfer";
  if (pathname.startsWith("/track")) return "Track transfer";
  return null;
}

export function SiteHeader() {
  const pathname = usePathname();
  const contextLabel = getContextLabel(pathname);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    setHelpOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!helpOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setHelpOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setHelpOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [helpOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3 no-underline"
          >
            <span className="flex size-8 shrink-0 items-center justify-center bg-brand font-display text-xs font-bold tracking-wide text-white">
              CN
            </span>
            <span className="min-w-0">
              <span className="block font-display text-sm font-bold tracking-[0.12em] text-navy uppercase">
                C.N Connect
              </span>
              <span className="hidden text-[11px] text-muted sm:block">
                International money transfer
              </span>
            </span>
          </Link>

          {contextLabel ? (
            <>
              <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
              <p className="hidden truncate text-sm text-muted sm:block">
                {contextLabel}
              </p>
            </>
          ) : null}
        </div>

        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/transfer"
            className={cn(
              "hidden px-3 py-2 text-sm font-medium no-underline transition-colors duration-150 sm:inline-flex",
              pathname.startsWith("/transfer")
                ? "text-brand"
                : "text-navy hover:text-brand",
            )}
          >
            Send money
          </Link>
          <Link
            href="/track"
            className={cn(
              "hidden px-3 py-2 text-sm font-medium no-underline transition-colors duration-150 sm:inline-flex",
              pathname.startsWith("/track")
                ? "text-brand"
                : "text-navy hover:text-brand",
            )}
          >
            Track transfer
          </Link>

          <div ref={rootRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={helpOpen}
              aria-controls={menuId}
              onClick={() => setHelpOpen((open) => !open)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors duration-150",
                helpOpen
                  ? "bg-surface text-navy"
                  : "text-muted hover:bg-surface hover:text-navy",
              )}
            >
              Help
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-150",
                  helpOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>

            {helpOpen ? (
              <div
                id={menuId}
                role="menu"
                aria-label="Help and support"
                className="absolute top-[calc(100%+8px)] right-0 w-[min(20rem,calc(100vw-2rem))] border border-border bg-background shadow-md"
              >
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    Need help?
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Reach our team {SUPPORT.hours}. Include your transfer
                    reference when you can.
                  </p>
                </div>

                <div className="p-1.5">
                  <p className="px-2.5 py-1.5 text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
                    Contact support
                  </p>
                  <SupportLink
                    href={SUPPORT.whatsappHref}
                    icon={MessageCircle}
                    label={SUPPORT.whatsappDisplay}
                    detail="Chat with us on WhatsApp"
                    external
                  />
                  <SupportLink
                    href={SUPPORT.phoneHref}
                    icon={Phone}
                    label={SUPPORT.phoneDisplay}
                    detail="Primary support line"
                  />
                  <SupportLink
                    href={SUPPORT.phoneSecondaryHref}
                    icon={Phone}
                    label={SUPPORT.phoneSecondaryDisplay}
                    detail="Alternate support line"
                  />
                  <SupportLink
                    href={SUPPORT.emailHref}
                    icon={Mail}
                    label={SUPPORT.email}
                    detail="Email the support desk"
                  />
                </div>

                <div className="border-t border-border p-1.5">
                  <p className="px-2.5 py-1.5 text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
                    Feedback
                  </p>
                  <SupportLink
                    href={SUPPORT.reportIssueHref}
                    icon={Bug}
                    label="Report an issue"
                    detail="Something broken or unclear?"
                  />
                  <SupportLink
                    href={SUPPORT.featureRequestHref}
                    icon={Lightbulb}
                    label="Request a feature"
                    detail="Tell us what to build next"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}

function SupportLink({
  href,
  icon: Icon,
  label,
  detail,
  external = false,
}: {
  href: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  detail: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      role="menuitem"
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-start gap-3 px-2.5 py-2.5 text-left no-underline transition-colors duration-150 hover:bg-surface"
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center border border-border bg-surface text-navy">
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground">
          {label}
        </span>
        <span className="block text-xs text-muted">{detail}</span>
      </span>
    </a>
  );
}
