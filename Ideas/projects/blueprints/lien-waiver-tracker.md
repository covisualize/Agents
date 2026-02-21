# Lien Waiver Tracker (Backup A)

## MVP

- Draw schedule tracking
- Waiver upload and status matrix
- Payment-ready gating by document completeness
- Reminder automation for missing waivers

## Suggested stack

- Cloudflare Workers + D1 + KV + R2
- Clerk auth
- Stripe billing

## Core entities

- `Job`
- `Draw`
- `Counterparty`
- `WaiverDocument`
- `RiskFlag`

## API contracts

- `POST /api/jobs/{id}/draws`
- `POST /api/waivers/upload`
- `GET /api/jobs/{id}/risk-summary`

## Acceptance focus

- Missing waiver blocks payment-ready state
- Duplicate waiver uploads are idempotent
- Reminder cadence sends only to unresolved parties
