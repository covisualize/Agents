# Architecture

## Stack

- Frontend: Next.js static generation + incremental revalidation
- Backend: Next.js route handlers or edge functions
- Data/Auth/Storage: Supabase
- Search: Postgres full-text (upgrade to dedicated search only if needed)
- Billing: Stripe subscriptions for sponsored placements

## Data flow

1. Seed listings from structured sources.
2. Store normalized venue and coach records.
3. Expose filtered listing endpoints for SEO and on-site search.
4. Accept owner claim requests and moderation actions.
5. Sell sponsored slots and surface them by metro/category.

## Shared module usage

- Use `@ideas/shared-core` for:
  - Stripe webhook idempotency
  - entitlement checks on sponsored features
  - audit logging for claim/moderation changes
