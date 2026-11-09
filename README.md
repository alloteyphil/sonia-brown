# Sonia Brown — Private Chef & Catering

Booking website and owner dashboard for Sonia Brown, a private chef in Accra.
Clients discover her, pick a real available date, and pay a deposit (card or
mobile money via Paystack) or request to pay in person. Sonia manages
everything from a phone-friendly dashboard.

**Stack:** Next.js 16 (App Router, TypeScript strict) · Tailwind CSS 4 with
shadcn-style components · Convex (database, server functions, realtime,
cron) · Better Auth on Convex (owner login) · Paystack (GHS, card + MoMo) · Resend (email) ·
Zod · React Hook Form · date-fns · Vitest + convex-test · Playwright.

---

## Brand

Sonia's favourite colour is blue, so the identity is an open-sky palette.
Tokens live in [`src/brand/tokens.ts`](src/brand/tokens.ts) and are mirrored as
CSS variables in [`src/app/globals.css`](src/app/globals.css).

| Token | Hex | Use |
|---|---|---|
| Night Sky | `#0B2239` | Text, dark surfaces, footer |
| Cloud | `#F5F9FD` | Page background |
| Harbour Blue | `#1C6DB5` | Primary buttons (5.4:1 with white, WCAG AA) |
| Harbour Deep | `#14548C` | Hover / pressed |
| **Sky** | `#7CC3EE` | Signature accent: highlights, illustrations, rules |
| Sky Mist | `#DDEFFB` | Tinted cards, selected states |
| Horizon | `#E2EAF2` | Borders |
| Sunlight | `#F2B544` | Tiny warm accent ("today", badges) |

- Type: **Fraunces** (display) + **DM Sans** (body), self-hosted via Fontsource.
- Wordmark "Sonia Brown / Private Chef & Catering" and an **SB** monogram with a sky-blue horizon line ([`src/components/site/logo.tsx`](src/components/site/logo.tsx), [`src/app/icon.svg`](src/app/icon.svg)).
- Tagline: *Cooked for you, at your table.*
- Voice: first person from Sonia. Copy lives in [`src/brand/content.ts`](src/brand/content.ts).

**Photos:** the site ships with sky-blue SVG placeholders. Drop real photos in
`public/images/` and update paths in [`src/brand/images.ts`](src/brand/images.ts).

---

## Getting started

```bash
npm install
cp .env.example .env.local
npx convex dev            # creates a Convex project, writes CONVEX_DEPLOYMENT + NEXT_PUBLIC_CONVEX_URL, keeps running
npm run seed              # 3 services, 5 clients, 7 bookings in various states, 1 blocked date
npm run dev               # http://localhost:3000
```

### 1. Owner login (Better Auth on Convex)

Auth runs inside Convex via `@convex-dev/better-auth` (`convex/auth.ts`); Next.js
proxies `/api/auth/*` to it. No third-party auth account is needed.

1. Add `NEXT_PUBLIC_CONVEX_SITE_URL` (your `.convex.site` URL) to `.env.local`.
2. `npx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"`
3. `npx convex env set SITE_URL http://localhost:3000`
4. `npx convex env set OWNER_EMAILS sonia@example.com`
5. Visit `/sign-in` → "First time? Create your account" with that email.

Only `OWNER_EMAILS` can sign up, and dashboard access is enforced again in
Convex (`convex/lib/auth.ts`) on every call.

### 2. Paystack (test mode)

1. Paystack dashboard → Settings → API Keys & Webhooks, in **Test mode**.
2. `npx convex env set PAYSTACK_SECRET_KEY sk_test_xxx`
3. `npx convex env set SITE_URL http://localhost:3000` (your public URL in production).
4. Webhook URL: `https://<your-deployment>.convex.site/paystack/webhook`
   (find `.convex.site` under Convex dashboard → Settings → URL).
5. Book on the site and pay with Paystack's test card `4084 0840 8408 4081`, any
   future expiry, CVV `408`, OTP `123456`; or test mobile money per Paystack docs.

How payments are trusted:

- The webhook signature (HMAC-SHA512 of the raw body) is checked before anything is read.
- Every event is recorded in `webhookEvents`, so replays are ignored (idempotent).
- The confirmation page never trusts the redirect: it asks Paystack's verify API from the server.
- Amount and currency come from Paystack, not the browser.

### 3. Resend (email, optional)

```bash
npx convex env set RESEND_API_KEY re_xxx
npx convex env set EMAIL_FROM "Sonia Brown <bookings@yourdomain.com>"
```

Without a key, emails are logged in the Convex dashboard and skipped. Emails
sent: request received, payment received / booked, confirmed, declined,
cancelled, rescheduled, completed (thank you), 2-day reminder, and a new-booking
alert to Sonia. All include "Add to calendar" and "Chat on WhatsApp".

---

## How it works

### Booking flow (`/book`)
1. Choose service → 2. Pick date & time (only genuinely open slots) → 3. Details
→ 4. Review & pay (30% deposit, full, or pay later) → Paystack → confirmation page + `.ics`.

**No double-booking:** `convex/bookings.ts → createBooking` re-checks the slot
and inserts in one Convex mutation. Convex mutations are serialisable
transactions, so two guests can't both get the same time.

**15-minute hold:** online bookings hold the slot while the guest is on
Paystack. A scheduled function releases it if unpaid (plus a 30-minute sweep as
a safety net). If a payment arrives late and the slot is still free, the booking
is revived; if not, it's flagged "needs attention" for a refund.

**Availability** (`src/lib/domain/availability.ts`) respects weekly hours,
blocked dates, minimum notice, max bookings per day, a travel/cleanup buffer
between bookings, slot interval and how far ahead people can book.

### Status lifecycle
`pending → confirmed → completed`, with `cancelled` and `declined` as exits.
Allowed transitions are defined once in [`src/lib/domain/status.ts`](src/lib/domain/status.ts).
Payment status (`unpaid`, `deposit_paid`, `paid`, `refunded`,
`partially_refunded`) is always derived from the payment rows.

### Dashboard (`/dashboard`)
Overview (today, next 7 days, requests to review, revenue this month,
outstanding balances) · Calendar (month / week / list) · Bookings (search,
filter, sort) · Booking detail (confirm/decline/complete/cancel, reschedule,
Maps link, dietary notes, record cash/MoMo/transfer payments, refunds incl.
optional Paystack refund, private notes, printable receipt/invoice) · Clients
· Services & pricing · Availability · Settings. Everything updates in real time.

### Data model (`convex/schema.ts`)
`services`, `customers`, `bookings`, `payments`, `availabilityRules`,
`blockedDates`, `settings`, `webhookEvents`, `rateLimits`. Money is integer
**pesewas**. Bookings store `lineItems`, so a menus/packages feature can add
lines later without changing totals logic. Bookings snapshot the service name
and price so editing a service never changes past bookings.

### Security
Server-side Zod validation, rate limits on booking (per email + global) and the
webhook (per IP), owner allowlist on sign-up and every dashboard function, session-cookie route
protection (`src/proxy.ts`), unguessable access tokens on guest confirmation
links, no secrets in the client, basic security headers.

### Timezone
Everything is `Africa/Accra`. Bookings store the local `date` and `startTime`
plus a UTC `startAt` for sorting.

---

## Project layout

```
convex/                 backend: schema, booking flow, payments, dashboard, emails, crons, seed
  payments/             PaymentProvider interface + Paystack implementation
src/lib/domain/         pure, tested logic: pricing, availability, status, time, money, ics, validation
src/brand/              tokens, copy, images
src/app/(site)/         public pages: home, services, about, contact, book, confirmation
src/app/dashboard/      owner dashboard
src/components/         ui primitives, site sections, booking wizard, dashboard shell
tests/unit/             pricing, availability, status
tests/convex/           backend tests via convex-test (double-booking, holds, webhook idempotency, auth)
tests/e2e/              Playwright booking flow on a phone viewport
scripts/preview/        fixture data for UI preview mode
```

## Scripts

| | |
|---|---|
| `npm run dev` | Next.js dev server |
| `npx convex dev` | Convex dev deployment (keep running) |
| `npm run seed` | Demo data |
| `npm test` | Unit + Convex backend tests |
| `npm run test:e2e` | Playwright booking flow (needs `npm run dev` + seeded Convex; `npx playwright install chromium` first) |
| `npm run typecheck` | Types for app and Convex |
| `npm run preview:ui` | Booking flow + dashboard with fixture data, no backend needed (for design work) |

## Deploying (Vercel)

1. `npx convex deploy` for a production Convex deployment; set the Convex env
   vars above on it (`npx convex env set --prod ...`), with `SITE_URL` = your domain.
2. Import the repo in Vercel. Set the Next.js env vars from `.env.example`
   (`NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `NEXT_PUBLIC_SITE_URL`).
   Optionally set the build command to `npx convex deploy --cmd 'npm run build'` with `CONVEX_DEPLOY_KEY`.
3. Update the Paystack webhook to the production `.convex.site` URL and switch to live keys.
4. Update business details in Dashboard → Settings (phone, WhatsApp, email, Instagram).

## Phase 2 ideas

- Menus and packages (attach to services; add booking line items)
- Reviews and testimonials
- Recurring bookings (weekly meal prep)
- WhatsApp / SMS reminders (e.g. via Twilio or Hubtel)
- Customer accounts and booking history
- Discount codes and gift cards
- Shopping lists generated from menus
