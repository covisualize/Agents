# Acceptance Tests

1. Project creation
- Given an authenticated owner with active subscription
- When they create a project
- Then the project is persisted and an audit log is written

2. Payroll run generation
- Given timesheet entries in a valid pay period
- When a payroll run is generated
- Then totals and classification mappings are created without duplicate entries

3. Report rejection loop
- Given a submitted report
- When reviewer rejection is recorded
- Then report status is `rejected`, correction tasks are created, and next revision can be generated

4. Billing gating
- Given a `past_due` subscription
- When a user attempts to generate a payroll run
- Then API returns payment-required behavior and no run is created

5. Webhook idempotency
- Given a Stripe webhook event id already processed
- When the same event is sent again
- Then no duplicate subscription mutation occurs
