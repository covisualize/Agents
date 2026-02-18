# Architecture

## Stack

- Frontend/API: Next.js on Vercel
- Data/Auth/Storage: Supabase
- Async jobs: Supabase scheduled functions + job table
- Billing: Stripe webhook synchronization
- Monitoring: Sentry + platform logs

## Data flow

1. User creates project and worker/classification mappings.
2. Timesheets are imported or entered.
3. `payroll_run` is generated for a pay period.
4. Certified report is produced and submitted.
5. Rejections create correction tasks and a new report revision.

## Shared module usage

- Use `@ideas/shared-core` for:
  - webhook idempotency
  - entitlement checks
  - audit event payloads
