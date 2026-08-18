import type { ReactNode } from "react";

type DashboardPageProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function DashboardPage({
  title,
  description,
  actions,
  children,
}: DashboardPageProps) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-[1.5rem] font-semibold tracking-tight text-navy">
            {title}
          </h1>
          {description ? (
            <p className="text-sm leading-relaxed text-muted">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
