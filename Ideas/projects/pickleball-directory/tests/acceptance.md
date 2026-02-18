# Acceptance Tests

1. Listing query
- Given active listings in multiple metros
- When searching by metro and listing type
- Then only matching records are returned

2. Submission intake
- Given a valid listing submission
- When submission API is called
- Then it is persisted as `pending` and audit logged

3. Claim workflow
- Given an unclaimed listing
- When a claim is submitted
- Then claim enters moderation queue and remains pending until resolved

4. Sponsorship entitlement
- Given non-active subscription state
- When user enables sponsored listing
- Then request fails with payment-required behavior

5. Ingestion resiliency
- Given mixed valid and invalid source records
- When nightly ingestion runs
- Then valid records are normalized and failures are counted without aborting run
