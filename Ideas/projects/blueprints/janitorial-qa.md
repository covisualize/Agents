# Janitorial QA & SLA Proof (Backup B)

## MVP

- Inspection templates per client/location
- Mobile-friendly inspection runs with photo evidence
- Issue assignment and closeout
- SLA scorecard generation

## Suggested stack

- Firebase Auth + Firestore + Cloud Functions + Storage
- Stripe billing

## Core entities

- `Location`
- `InspectionTemplate`
- `InspectionRun`
- `Issue`
- `SLAReport`

## API/function contracts

- `POST /functions/startInspection`
- `POST /functions/closeIssue`
- `GET /functions/location/{id}/sla-report`

## Acceptance focus

- Inspection score rollup accuracy by period
- Evidence photos linked to issues
- SLA report reproducible from immutable run data
