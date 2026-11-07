# Deployment: GitHub → Vercel + Supabase + Stripe

**Do not go live until real shop details, legal policy, pricing, taxes and production account permissions have been reviewed.**

## 1. Install and verify

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

Generate and commit the lockfile from `npm install` so GitHub Actions can use `npm ci`. If your package manager reports a version incompatibility, choose compatible maintained versions and regenerate the lockfile. The dependencies have not been installed in the package-creation environment.

## 2. Supabase

Create separate Supabase projects for **staging** and **production**. Apply the reviewed SQL migration separately to each project and validate RLS grants/policies. Add a staff Auth user and its ID to `public.admins` using a privileged SQL editor. Use different credentials per environment.

Verify:

- Anonymous users see only `is_available=true` products.
- Anonymous users **cannot** read/write `orders`, `order_items`, `contact_messages`, or `admins`.
- Signed-in non-admins cannot access `/admin`.
- Signed-in admins can edit products and view paid orders through server actions.

Supabase project backups/retention depend on your plan. Configure and test a recovery path.

## 3. Stripe

Start with **test keys**. Configure the Stripe webhook endpoint:

```text
https://YOUR-DOMAIN.example/api/stripe/webhook
```

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`

Set the webhook signing secret in Vercel. Test valid/invalid signatures, successful and failed payments, and replayed events. Switch to live keys only after payment and business approval.

## 4. GitHub / Vercel

1. Create a private GitHub repository and push this project's files (except secrets).
2. Connect repository to a new Vercel Next.js project.
3. Add environment variables in **Preview** and **Production** separately:

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Both | Exact deployed origin; no trailing slash preferred |
| `NEXT_PUBLIC_SUPABASE_URL` | Both | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Both | Public browser-safe key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Secret; never expose |
| `STRIPE_SECRET_KEY` | Server only | Test/live matched to environment |
| `STRIPE_WEBHOOK_SECRET` | Server only | Unique per endpoint |
| `STORE_TIMEZONE` | Both | IANA timezone of the actual shop |

4. Vercel framework: **Next.js**; Build command: `npm run build`.
5. Preview-build and verify every MVP route with staging/test keys.
6. Add the real custom domain and DNS records. Set `NEXT_PUBLIC_SITE_URL` to the verified HTTPS origin.
7. Confirm HTTPS, metadata/SEO, webhook delivery, pickup hours, and admin protections.
8. Obtain explicit authorization before switching payments to live and promoting to production.

## 5. Security gate before go-live

- Add production-grade IP/user abuse controls to `/api/checkout` and `/api/contact`.
- Confirm application and database backups, real restore test, and error reporting.
- Use a reviewed privacy/terms/refund policy and accurate location/contact details.
- Reconcile tax rules and checkout display.
- Confirm any required food safety / allergen disclosures.
- Disable or replace all demo content and images as needed.
- Use strong staff credentials and MFA policies in your auth provider.
- Run vulnerability scanning, end-to-end tests, and manual mobile accessibility checks.

## Rollback

Vercel can roll back to a prior successful **code** deployment. **Database migrations do not automatically roll back** with application releases. Before any destructive schema change, create a compatible migration plan and a verified backup; schedule and approve the production migration independently.

## No automatic deployment in this archive

This repository includes Vercel configuration and a CI workflow, but it has **not** been deployed to a live site and no Vercel or GitHub repository was created by the packaging process.
