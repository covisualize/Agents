# Commercial Kitchen Directory (Directory Backup)

## MVP

- Metro-based kitchen listings
- Filters by certifications/equipment/hours
- Paid featured profiles
- Lead inquiry form with routing

## Suggested stack

- Cloudflare Workers + D1 + R2
- Stripe billing for featured placements

## Core entities

- `KitchenListing`
- `Certification`
- `EquipmentSet`
- `AvailabilityWindow`
- `LeadInquiry`

## API contracts

- `GET /api/kitchens?city=&cert=`
- `POST /api/inquiries`
- `POST /api/listings/{id}/feature`

## Acceptance focus

- Filtering precision across city + certification
- Featured ordering obeys active slot windows
- Inquiry dedupe by sender/listing/time window
