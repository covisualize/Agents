import test from "node:test";
import assert from "node:assert/strict";

import { SubscriptionStatus } from "../../../packages/shared-core/src/index.js";
import { PickleballDirectoryService } from "../src/service.js";
import { createDirectoryStore } from "../src/store.js";

function buildCtx() {
  const { store, seed } = createDirectoryStore();
  return {
    service: new PickleballDirectoryService(store),
    seed
  };
}

test("listing query filters by metro and type", () => {
  const { service } = buildCtx();
  service.runIngestion({
    source: "seed",
    records: [{ name: "Chicago Smash", metro: "chicago", listingType: "club" }]
  });

  const result = service.queryListings({ metro: "chicago", type: "club" });
  assert.equal(result.total, 1);
  assert.equal(result.results[0].name, "Chicago Smash");
});

test("submission creates pending record", () => {
  const { service } = buildCtx();
  const submission = service.createSubmission({
    name: "Court 16",
    metro: "austin",
    listingType: "venue"
  });
  assert.equal(submission.status, "pending");
});

test("claim can be resolved", () => {
  const { service, seed } = buildCtx();
  const claim = service.createClaim(seed.listingId, {
    claimantEmail: "owner@example.com",
    verificationNote: "Utility bill attached"
  });
  const resolved = service.resolveClaim(claim.id, "approved");
  assert.equal(resolved.status, "approved");
});

test("sponsorship requires active subscription", () => {
  const { service, seed } = buildCtx();
  service.setSubscriptionStatus(seed.accountId, SubscriptionStatus.PAST_DUE);
  assert.throws(
    () => service.enableSponsoredListing(seed.listingId, { accountId: seed.accountId }),
    (error) => error.statusCode === 402
  );
});

test("ingestion tracks processed and failed counts", () => {
  const { service } = buildCtx();
  const run = service.runIngestion({
    source: "batch-1",
    records: [
      { name: "Valid Venue", metro: "miami", listingType: "venue" },
      { name: "Invalid Venue", metro: "miami" }
    ]
  });
  assert.equal(run.recordsProcessed, 1);
  assert.equal(run.recordsFailed, 1);
});
