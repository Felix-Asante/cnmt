export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative flex flex-1 flex-col justify-center overflow-hidden bg-background px-6 py-20 md:px-12 lg:px-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--brand-soft),transparent_55%),radial-gradient(ellipse_at_bottom_left,var(--navy-soft),transparent_50%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle,var(--navy)_1px,transparent_1px)] bg-size-[18px_18px] opacity-[0.06]"
        />

        <div className="relative max-w-3xl">
          <p className="mb-6 font-display text-sm font-semibold tracking-[0.22em] text-brand uppercase">
            C.N Connect
          </p>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-[0.02em] text-foreground uppercase">
            <span className="text-brand">C.N</span> International
            <br />
            <span className="text-brand">Money Transfer</span>
          </h1>
          <p className="mt-6 max-w-[65ch] text-lg text-muted md:text-xl">
            Secure, reliable transfers across borders — built for people who
            move money with intention.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/transfer"
              className="inline-flex items-center justify-center rounded-pill bg-brand px-7 py-3 font-display text-sm font-bold tracking-[0.14em] text-white uppercase no-underline transition-colors duration-200 hover:bg-brand-hover"
            >
              Send money
            </a>
            <a
              href="#how"
              className="inline-flex items-center justify-center rounded-pill border border-border-strong bg-transparent px-7 py-3 font-display text-sm font-bold tracking-[0.14em] text-navy uppercase no-underline transition-colors duration-200 hover:border-navy hover:bg-navy-soft"
            >
              How it works
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
