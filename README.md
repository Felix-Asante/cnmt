# C.N Connect

Web monorepo for **C.N International Money Transfer** — a cross-border remittance product that helps people send money from Europe and Morocco to family and partners across Africa.

The customer-facing app is built as a premium fintech experience: clear rates, verified payouts, and a short path from corridor selection to submitted transfer request.

---

## Product

**Brand:** C.N Connect / C.N International Money Transfer  
**Promise:** Smooth, secure international money transfer  
**Primary action:** Start a transfer → `/transfer`

### Corridors

| Direction | Markets |
| --- | --- |
| **Send from** | United Kingdom, France, Spain, Morocco |
| **Receive in** | Ghana, Nigeria, Sierra Leone, Liberia, Kenya, Uganda, Morocco |

Payout methods depend on the destination: **mobile money** and/or **bank transfer**. Morocco receives via bank only.

### Transfer flow (customer app)

1. **Transfer** — choose From → To corridor and amount (currency locked to sender country)
2. **Recipient** — sender WhatsApp, recipient name, and channel-specific payout details
3. **Submitted** — request logged; payment & proof come next
4. **Pay → Upload proof → Done** — fulfillment after the request exists

The transfer UI is frontend-first today (form validation, quotes, local “recent corridor / saved recipient” memory). Submitting a request logs the payload for handoff to a real API later.

---

## Repository layout

Bun + Turborepo monorepo.

```
apps/
  customer/          # Next.js customer site + transfer flow
packages/
  ui/                # Shared UI primitives (button, inputs, corridor picker, …)
  tailwind-config/   # Design tokens & shared Tailwind styles
  eslint-config/     # Shared ESLint configs
  typescript-config/ # Shared TypeScript configs
```

### Customer app (`apps/customer`)

| Area | Role |
| --- | --- |
| `src/app/` | Next.js App Router routes (`/`, `/transfer`) |
| `src/sections/home/` | Marketing homepage |
| `src/sections/new-transfer/` | Transfer flow orchestrator, schema, steps |
| `src/components/` | Site chrome (header, footer) |
| `src/constants/` | Support contacts |

Routes stay thin; product UI lives in `sections/`. Shared components that other apps may reuse live in `@repo/ui`.

---

## Stack

- **Runtime / package manager:** Bun
- **Apps:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4, shared tokens in `@repo/tailwind-config`
- **Forms:** React Hook Form + Zod
- **Motion:** Framer Motion
- **Monorepo:** Turborepo

**Brand system:** flyer-derived red / navy / gold; display type **Barlow Condensed**, body **Schibsted Grotesk**.

---

## Getting started

### Requirements

- Node.js 18+
- [Bun](https://bun.sh) 1.2+

### Install

```sh
bun install
```

### Develop

Run everything:

```sh
bun run dev
```

Or only the customer app:

```sh
bun run dev --filter=customer
```

Open [http://localhost:3000](http://localhost:3000).

### Build & check

```sh
bun run build
bun run lint
bun run check-types
```

Format:

```sh
bun run format
```

---

## Working in the monorepo

- Prefer shared UI in `packages/ui` when a control is reusable across apps.
- Keep app-specific flow logic in `apps/customer/src/sections/…`.
- Design tokens (colors, radii, shadows, fonts) belong in `packages/tailwind-config` — apps import `@repo/tailwind-config` from their CSS entry.

Filter Turborepo tasks with `--filter=<package-name>` (e.g. `customer`, `@repo/ui`).

---

## Support (product)

C.N Connect support is available Mon–Sat · 9:00–18:00 GMT via WhatsApp and phone (see `apps/customer/src/constants/support.ts`).

---

## Status

Active product build. The customer homepage and transfer request flow are in place; payment verification and backend integration are the next layers on the same architecture.
