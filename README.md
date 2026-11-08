# Brew & Bean Coffee ☕

A full-stack coffee shop ordering website built with **Next.js, React, TypeScript, Tailwind CSS, Supabase, and Stripe**.

Customers can browse drinks and pastries, customize individual cups, choose quantities, add products to a shared cart, and place pickup orders through Stripe Checkout. Staff can manage products and orders through a protected admin dashboard.

> **Project status:** Development / testing. The site is not production-ready until the local build, database permissions, payment webhooks, pricing, and end-to-end ordering flow have been verified. Brew & Bean is a demonstration brand; replace sample products, prices, photos, and shop details before launch.
>
> **Version note:** This README documents the latest intended local implementation after the Beverage customization and Food & Pastries quantity updates. Since the working project is on your computer, confirm that the corresponding source changes have been applied before treating a feature as complete.

## Features

### Beverage (`/menu`)

- Browse beverages by category: Coffee, Cold Brew, Matcha, and Tea.
- Search by name or description.
- Filter by **Cup Size** based on sizes available in `products.size_prices`.
- Sort by recommended, price (low to high / high to low), or name.
- Select a drink to open its dedicated customization page (`/menu/[slug]`).
- Beverage product cards **do not** add drinks directly to the cart; customization happens first.

### Drink customization (`/menu/[slug]`)

- Select a size and **quantity for each cup selection**.
- Use **Add another cup or size** to build mixed orders, such as **Cappuccino — Medium × 1 and Large × 1**.
- Configure each selection independently: vanilla syrup pumps, extra espresso shots, espresso style, and ice preference where supported.
- See updated totals before adding selections to the shared cart.
- Keep identical selections together, but preserve different sizes or add-ons as separate cart lines.
- Revalidate selected sizes, permitted customizations, and prices in the backend at checkout.

**Example:** Medium Cappuccino with no syrup and Large Cappuccino with an extra shot become **two distinct cart lines**, even though they are the same product.

### Food & Pastries (`/food`)

- Browse croissants, muffins, cookies, and other bakery items.
- Use a **Quantity `− / +` stepper** instead of showing the internal serving-size value `One`.
- Add multiple pastries in one click. Example: Butter Croissant × 3 adds quantity 3 to the cart.
- Bakery and beverage items share the same cart, orders, and checkout.

**Important:** The database may still use `size_prices: { "One": 420 }` for single-serving pastries. `One` is an **internal pricing key**, not text shown in the bakery quantity selector. Do not rename that key without updating the backend and existing cart data.

### Cart, checkout, and administration

- Persistent shopping bag with item quantities and per-variant pricing.
- Guest pickup checkout: customer details, requested pickup date/time, and Stripe Checkout redirection.
- Stripe webhook handling to update payment state after signature verification.
- Protected admin login using Supabase Auth and the `admins` membership table.
- Product, availability, and order management (subject to the admin functions installed in your local version).

## Technology stack

| Layer                | Technology                                     |
| -------------------- | ---------------------------------------------- |
| Frontend             | Next.js 15 App Router, React 19, TypeScript    |
| Styling              | Tailwind CSS and custom CSS                    |
| Backend              | Next.js Route Handlers and server-side actions |
| Database             | Supabase PostgreSQL                            |
| Admin authentication | Supabase Auth with server-side authorization   |
| Payments             | Stripe Checkout + signed webhooks              |
| Tests                | TypeScript, ESLint, Vitest, Playwright         |
| Deployment target    | Vercel + GitHub                                |

## Pages and routes

| Route                 | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `/`                 | Homepage and featured products                            |
| `/menu`             | Beverage menu: search, category, cup-size filter, sorting |
| `/menu/[slug]`      | Product-specific drink customization and quantities       |
| `/food`             | Food & Pastries menu with quantity controls               |
| `/cart`             | Shopping bag with drink variants and pastries             |
| `/checkout`         | Guest pickup checkout                                     |
| `/checkout/success` | Payment result verification                               |
| `/about`            | Brand story                                               |
| `/contact`          | Store details and contact form                            |
| `/admin/login`      | Staff login                                               |
| `/admin`            | Product and order management                              |
| `/privacy`          | Privacy notice draft; requires review before production   |

## Local setup (Windows / VS Code)

**Requirements:** Node.js 22+ (recommended for this starter), npm, and valid Supabase/Stripe credentials for integrated checkout.

Open PowerShell in the project root:

```powershell
cd C:\My-Coding-Projects\brew-bean-coffee
npm install
Copy-Item .env.example .env.local
npm run dev
```

If `.env.local` already exists and is configured, **do not overwrite it**. Visit `http://localhost:3000`.

### Environment variables

Copy these *names* into `.env.local` and provide your own values. Never commit real keys.

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STORE_TIMEZONE=America/Chicago
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SECRET_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_TEST_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LOCAL_LISTENER_SECRET
NEXT_PUBLIC_SHOP_NAME=Brew & Bean Coffee
```

- `NEXT_PUBLIC_*` values are visible to the browser; **never** place service-role/secret keys in those variables.
- `SUPABASE_SERVICE_ROLE_KEY` is the server-only variable name used in this project, even if your Supabase dashboard labels the value a **Secret Key**.
- Development should use **Stripe test/sandbox credentials**, not live credentials.
- Restart `npm run dev` after changing `.env.local`.

## Database

The initial SQL schema is stored at:

`supabase/migrations/20261030170000_initial_schema.sql`

It defines products, orders, order items, admins, and contact messages. `products.category = 'bakery'` is used for Food & Pastries, so no new table is necessary for bakery products.

### Drink customizations (existing database)

If you have not already applied the customization update, run this **once** in the Supabase SQL Editor:

```sql
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS customizations jsonb
NOT NULL DEFAULT '{}'::jsonb;
```

This allows each order item to store its selected syrups, espresso shots, espresso style, and ice preference. For a migration-managed project, put schema changes in a proper version-controlled migration instead of applying undocumented production SQL.

Product `size_prices` values, selected options, and sample add-on prices must be reviewed before accepting real orders. Sample add-on fees in `src/lib/customizations.ts` include vanilla syrup and extra espresso shots.

## Stripe checkout testing

1. Make sure the application runs on `http://localhost:3000` and `.env.local` has a **test/sandbox** `STRIPE_SECRET_KEY`.
2. Open another PowerShell terminal and authenticate the Stripe CLI to the matching test/sandbox environment.
3. Run a local webhook listener:

```powershell
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed --forward-to localhost:3000/api/stripe/webhook
```

4. Copy the `whsec_...` printed by the listener into `STRIPE_WEBHOOK_SECRET`, restart Next.js, and keep the listener running.
5. Create a test order via `/menu` or `/food` → `/cart` → `/checkout`.
6. Verify payment result, order rows, item quantities, modifiers, and webhook status in the database and Stripe test dashboard.

**Security:** The server should use the product ID, selected size, validated modifiers, and current Supabase prices to calculate charges. Do not trust totals submitted by the browser. Do not infer that payment succeeded merely because a user reached the success page.

## Main source structure

```text
src/
├── app/
│   ├── page.tsx
│   ├── menu/
│   │   ├── page.tsx                 # Beverage menu
│   │   └── [slug]/page.tsx          # Drink customization route
│   ├── food/page.tsx                # Food & Pastries
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── admin/
│   ├── api/checkout/route.ts
│   ├── api/stripe/webhook/route.ts
│   └── globals.css
├── components/
│   ├── menu-filter.tsx
│   ├── product-card.tsx
│   ├── drink-configurator.tsx
│   ├── cart-provider.tsx
│   ├── cart-view.tsx
│   └── checkout-form.tsx
├── lib/
│   ├── catalog.ts
│   ├── customizations.ts
│   ├── validation.ts
│   └── supabase/
└── types/index.ts
```

The exact tree may differ if you have not applied every UI update in your local project.

## Development and QA commands

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Recommended manual regression tests:

1. Beverage filters, sorting, and direct navigation to a product detail page.
2. Cappuccino Medium × 1 + Large × 1 with different add-ons → **two cart lines**.
3. Two completely identical drink configurations → **one aggregated variant with the correct quantity**.
4. Croissant quantity 3 → cart quantity 3; no `One` label visible on the Food card.
5. Cart totals and backend checkout totals match database prices and configured add-ons.
6. Stripe test webhook updates orders correctly; admin can view the relevant details.
7. Responsive layouts, keyboard navigation, and reduced-motion preferences.

## Troubleshooting

| Symptom                                                         | What to check                                                                                                         |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `Cannot find module '@/lib/customizations'`                   | Confirm `src/lib/customizations.ts` exists and `@/*` points to `./src/*` in `tsconfig.json`.                  |
| `SelectedCup` / `CartItem.customizations` TypeScript errors | Synchronize `src/types/index.ts`, `cart-provider.tsx`, `validation.ts`, and `checkout-form.tsx`.              |
| TypeScript errors under `backup-motion-*`                     | Move backup folders **outside** the project root; TypeScript may scan them.                                     |
| `Unexpected eof` in `drink-configurator.tsx`                | The component was pasted incompletely; restore the complete ending/closing JSX tags.                                  |
| Product image returns `404`                                   | Confirm that the exact path exists under `public/images/` or update `products.image_url`.                         |
| Stripe checkout cannot start                                    | Check server logs, matching test credentials, valid pickup time, database order writes, and `NEXT_PUBLIC_SITE_URL`. |
| Webhook returns HTTP 400                                        | Check the signing secret from the *currently running* Stripe listener or configured production endpoint.            |
| UI looks unstyled                                               | Confirm the latest drink-customizer CSS is present in `src/app/globals.css`.                                        |

## Deployment

1. Run type checking, linting, tests, and a production build successfully.
2. Push the project to a private GitHub repository; verify `.env.local` and secrets are ignored.
3. Import the repository into Vercel.
4. Configure Preview and Production environment variables separately. Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS deployment URL for each environment.
5. Configure a **separate Stripe webhook endpoint and signing secret** for the deployed URL (not the temporary CLI secret).
6. Test database access, admin authorization, product modifiers, pastry quantities, checkout, and webhook behavior on a Preview deployment before authorizing production.
7. Review shop details, allergens, taxes, refunds, privacy, abuse protection, monitoring, and backups before handling real customer payments.

See `DEPLOYMENT.md`, `MAINTENANCE.md`, and `ARCHITECTURE.md` for additional operational details if those files are present in your local project.

## Maintenance

- Run tests and a production build before releasing changes.
- Review dependency/security updates and production errors regularly.
- Keep Stripe/Supabase secrets out of Git, screenshots, and client components.
- Verify database backups and recovery procedures.
- Review new menu items, price changes, product availability, and modifiers before publishing.

No recurring monitoring or backup job is automatically active just because this README describes it; those services must be configured and verified separately.

---

*Last documentation update: 2026-11-07 · Brew & Bean Coffee — development version.*
