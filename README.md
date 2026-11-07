# Brew & Bean Coffee ☕

Full-stack specialty coffee storefront starter built with **Next.js 15 + React 19 + TypeScript + Tailwind CSS + Supabase + Stripe**. Includes customer pages, cart, guest pickup checkout, server-verified pricing, Stripe webhook payments, admin login and product/order management.

> **Important:** Brew & Bean is a **fictional demo brand**. Product prices, menu, business hours and illustrations are placeholders. **Real payments are disabled** until Supabase and Stripe are configured. No real credentials, production integrations or live deployment are included in this archive. Do not use for paying customers without completing `DEPLOYMENT.md` and `MAINTENANCE.md`.

## Available pages

| Route                 | Purpose                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `/`                 | Editorial homepage, featured products, brand story                 |
| `/menu`             | Product grid, search, category filters, size selection, add-to-bag |
| `/cart`             | Persistent shopping bag, quantity editing, subtotal                |
| `/checkout`         | Customer details, pickup scheduling, Stripe redirect               |
| `/checkout/success` | Validates payment directly with Stripe                             |
| `/about`            | Brand story                                                        |
| `/contact`          | Hours, location placeholder, contact form                          |
| `/admin/login`      | Staff email/password login                                         |
| `/admin`            | Product editing, availability, paid orders and contact messages    |
| `/privacy`          | Placeholder privacy draft — legal review required                 |

## Get running (preview mode)

Requires Node.js 22+ and npm. Network access is required for the first dependency installation.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Without Supabase variables, the **demo menu** and **local cart** work; checkout and contact form explicitly refuse to claim success. The preview is designed to make UI/UX review easy without external services.

To run checks after installing dependencies:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

**Validation note:** This archive was assembled in an environment without npm registry access or a working external database. A full Next.js compile, dependency installation, Supabase migration execution, Stripe payment run and Vercel deployment could not be verified here. Run these commands on your own machine or CI and fix any environment-specific errors before launch.

## Turn on real database features

1. Create a **new** Supabase project and note its project URL and publishable key.
2. Apply `supabase/migrations/20261030170000_initial_schema.sql` using the SQL Editor (or your configured Supabase CLI workflow). This creates protected products, orders, order items, admin memberships, and contact messages, then seeds sample menu items.
3. Create a staff account in **Authentication > Users**. Once the account exists, add its user ID to `public.admins` from the SQL Editor:

```sql
insert into public.admins (user_id) values ('YOUR_AUTH_USER_UUID');
```

4. Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
5. Restart development server. `/menu` reads from Supabase and `/admin/login` is available for your staff account.
6. **Do not** paste the service key into `NEXT_PUBLIC_*` or commit `.env.local`.

No customer login is needed: this is a guest-order pickup flow. The separate `admins` table is the authority for staff privileges; user-editable profile metadata is not trusted.

## Turn on real test payments

1. Create a Stripe account and obtain the **test mode secret key**.
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `.env.local`.
3. Run a Stripe CLI webhook forwarding tunnel (read the `stripe listen --help` commands for your installed CLI) to `http://localhost:3000/api/stripe/webhook` and copy its webhook signing secret to `STRIPE_WEBHOOK_SECRET`.
4. Restart the app. Choose items from the **Supabase-backed** menu, set a pickup time, and open Stripe Checkout. Test payment through Stripe's test cards.
5. Confirm the order remains `pending_payment` until Stripe sends a correctly signed paid webhook. The admin dashboard will show paid orders, which can then move through `preparing`, `ready`, and `completed`.

**Prices are never read from the cart for final charge calculations.** On checkout, the server loads each product from Supabase, verifies selected sizes and prices, then creates the Stripe session.

## Project structure

```text
src/app/              Routes, server actions and APIs
src/components/       UI, menu, persistent bag and contact forms
src/lib/              Supabase clients, Stripe, validation, money, catalog
src/types/            TypeScript domain types
src/middleware.ts     Admin Auth cookie refresh
public/images/        Custom SVG artwork (no external image dependency)
supabase/migrations/  PostgreSQL schema + RLS + demo seed
.github/workflows/    CI checks
DEPLOYMENT.md         Production setup and deployment
MAINTENANCE.md        Operations and incident response
ARCHITECTURE.md       Architecture and authorization boundaries
```

## Known launch blockers (intentional)

- No live Supabase/Stripe accounts or permissions supplied, so API integrations cannot be tested end-to-end here.
- Brand, address, phone, contact email, images and operating hours must be replaced with verified shop details.
- Configure production API rate limits / bot defense for public write endpoints. Honeypot alone is not production-grade abuse protection.
- Confirm tax treatment, refunds, cancellation rules, food-allergen policy, privacy notice, and data retention with the business.
- Verify recovery/backup configuration with your Supabase plan and restore test.
- Configure monitoring and uptime alerts in your own services.
- Generate and commit `package-lock.json` with `npm install` and use `npm ci` in CI; no lockfile is included because installation could not run in this environment.

## Copyright / media

SVG artwork in `public/images` is created specifically for this example project. No third-party paid fonts or photos are bundled. All customer testimonials are omitted to avoid fictitious endorsements.
