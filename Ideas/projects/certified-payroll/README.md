# Certified Payroll (Primary SaaS)

This project implements a compliance workflow for public-works subcontractors:

- Project and worker setup
- Weekly payroll run generation
- Certified report lifecycle (draft -> submitted -> rejected -> corrected)
- Audit trail and Stripe-backed subscription gating

## Core endpoints

- `POST /api/projects`
- `POST /api/payroll-runs/generate`
- `POST /api/reports/{reportId}/submit`
- `POST /api/reports/{reportId}/rejections`

See `openapi.yaml` and `supabase/schema.sql` for implementation contracts.

## Run locally

```bash
node src/server.js
```

Server defaults to `http://localhost:4301`.

## Bootstrapping

Use this endpoint to get seeded actor context:

```bash
GET /api/bootstrap
```

Response includes:

- `organizationId`
- `ownerUserId` (use as `actorUserId` with `actorRole=owner`)
