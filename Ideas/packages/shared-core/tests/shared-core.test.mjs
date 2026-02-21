import test from "node:test";
import assert from "node:assert/strict";

import {
  AppError,
  assertAllowedRole,
  createAuditEvent,
  hasEntitlement,
  IdempotencyStore,
  invariant,
  matchPath,
  mapStripeEventToStatus,
  newId,
  SubscriptionStatus
} from "../src/index.js";

test("billing entitlement only active", () => {
  assert.equal(hasEntitlement(SubscriptionStatus.ACTIVE), true);
  assert.equal(hasEntitlement(SubscriptionStatus.PAST_DUE), false);
});

test("stripe event mapping", () => {
  assert.equal(mapStripeEventToStatus("invoice.paid"), SubscriptionStatus.ACTIVE);
  assert.equal(mapStripeEventToStatus("invoice.payment_failed"), SubscriptionStatus.PAST_DUE);
  assert.equal(mapStripeEventToStatus("unknown"), null);
});

test("idempotency claim blocks duplicates", () => {
  const store = new IdempotencyStore();
  assert.equal(store.claim("evt_123"), true);
  assert.equal(store.claim("evt_123"), false);
});

test("audit event validates required fields", () => {
  const evt = createAuditEvent({
    actorId: "user_1",
    action: "payroll_run.generated",
    resourceType: "payroll_run",
    resourceId: "run_1"
  });
  assert.equal(evt.resourceId, "run_1");
  assert.ok(evt.createdAt);
});

test("path matcher extracts params", () => {
  const params = matchPath("/api/reports/abc/submit", "/api/reports/:reportId/submit");
  assert.deepEqual(params, { reportId: "abc" });
});

test("newId applies prefix", () => {
  const id = newId("test");
  assert.equal(id.startsWith("test_"), true);
});

test("role authz throws forbidden", () => {
  assert.throws(
    () => assertAllowedRole("member", ["owner"]),
    (error) => error instanceof AppError && error.statusCode === 403
  );
});

test("invariant throws app error", () => {
  assert.throws(
    () => invariant(false, "boom"),
    (error) => error instanceof AppError && error.message === "boom"
  );
});
