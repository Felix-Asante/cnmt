import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs font-medium tracking-[0.16em] text-brand uppercase">
        C.N Connect
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy">
        Dashboard
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        Operations console for transfers, verification, and payouts.
      </p>
    </main>
  );
}
