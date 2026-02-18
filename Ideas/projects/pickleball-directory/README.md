# Pickleball Directory (Primary Directory)

This project is the SEO/data track:

- Metro and category listing pages
- Listing submission and claim workflows
- Sponsored placements for monetization
- Nightly listing refresh jobs

## Core endpoints

- `GET /api/listings`
- `POST /api/submissions`
- `POST /api/listings/{listingId}/claim`
- `POST /api/listings/{listingId}/feature`

See `openapi.yaml` and `supabase/schema.sql` for implementation contracts.

## Run locally

```bash
node src/server.js
```

Server defaults to `http://localhost:4302`.

## Bootstrapping

Use this endpoint to get seeded account context:

```bash
GET /api/bootstrap
```

Response includes:

- `accountId`
- `listingId`
