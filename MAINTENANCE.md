# Maintenance & operations

## Daily (automate once services are connected)

- Check production uptime and critical checkout routes.
- Watch Stripe webhook delivery failures and payment-to-order mismatches.
- Monitor application exception counts and database connectivity.
- Alert the shop operator on sustained payment or order-processing failures.

## Weekly

- Review error logs, pending orders older than expected, webhook retries and support messages.
- Review failed CI checks and dependency/security alerts.
- Inspect pickup schedule logic and edge cases for timezones/daylight saving.
- Verify backups completed and storage growth is reasonable.

## Monthly

- Apply tested security dependency updates in preview, then production.
- Audit admin users and least-privilege permissions.
- Review site performance, accessibility, SEO, mobile conversion, and operational costs.
- Review orders/contact data retention and remove expired records according to the business's approved retention policy.

## Quarterly

- Perform a verified restore of a database backup to an isolated environment.
- Test rollback of a code deployment.
- Audit Supabase grants/RLS policies and Stripe webhook signature validation.
- Review framework updates, monitoring coverage and the incident contact tree.

## Incident response

1. Identify the failing workflow and impact (checkout unavailable? payments captured without order? server errors?).
2. Pause or disable ordering if payment integrity is at risk.
3. Review sanitized application logs, Stripe Dashboard events, and Supabase changes.
4. Fix root cause in a feature branch and add regression tests.
5. Verify in preview with test transactions and replay scenarios.
6. Deploy after approval, monitor error rates and reconcile affected orders.
7. Document the incident and preventive follow-ups.

## Known operational integrations still to configure

- Production exception monitoring (e.g., Sentry), uptime checks, and alert recipients.
- Backup policies and actual restore drill.
- Rate limiting / bot detection on public write endpoints.
- Payment reconciliation and business-approved cancellation/refund workflow.
- Periodic reminder/maintenance automation. This file is a checklist, **not** a running automation.

## Suggested next features

1. Inventory and temporary sold-out controls.
2. Staff order notification email or push.
3. Accurate tax configuration and receipt workflow.
4. Open hours / holiday closures in database.
5. Stripe refund state reconciliation.
6. Uploaded product images with Supabase Storage and restricted policies.
7. Accessibility audit, analytics and search console after launch.
