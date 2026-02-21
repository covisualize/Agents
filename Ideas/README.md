# Ideas Workspace

This directory contains an isolated implementation scaffold for the solo-founder portfolio plan:

- `projects/certified-payroll/` - primary B2B SaaS build
- `projects/pickleball-directory/` - primary directory SEO build
- `packages/shared-core/` - shared modules for authz/billing/idempotency/audit patterns

## Goals

- Keep ops simple and solo-founder friendly.
- Reuse shared patterns across projects.
- Provide implementation-ready contracts, schema, and acceptance criteria.

## Quick start

1. Run tests:
   - `node --test packages/shared-core/tests/*.test.mjs projects/certified-payroll/tests/*.test.mjs projects/pickleball-directory/tests/*.test.mjs`
2. Start services:
   - `node projects/certified-payroll/src/server.js`
   - `node projects/pickleball-directory/src/server.js`
3. Pull seed identity values from:
   - `GET /api/bootstrap` on each service
4. Apply SQL schema files to Supabase when moving from in-memory MVP to hosted data.

## Layout

```text
Ideas/
  package.json
  projects/
    certified-payroll/
    pickleball-directory/
  packages/
    shared-core/
```
