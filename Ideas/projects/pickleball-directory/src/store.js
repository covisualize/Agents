import { SubscriptionStatus, newId } from "../../../packages/shared-core/src/index.js";

export function createDirectoryStore() {
  const store = {
    listings: new Map(),
    submissions: new Map(),
    listingClaims: new Map(),
    sponsoredSlots: new Map(),
    ingestionRuns: new Map(),
    accountSubscriptions: new Map(),
    webhookEvents: new Set(),
    auditLogs: []
  };

  const seedAccountId = newId("acct");
  store.accountSubscriptions.set(seedAccountId, {
    accountId: seedAccountId,
    status: SubscriptionStatus.ACTIVE,
    updatedAt: new Date().toISOString()
  });

  const seedListingId = newId("listing");
  store.listings.set(seedListingId, {
    id: seedListingId,
    listingType: "venue",
    name: "Riverfront Pickleball Club",
    metro: "nashville",
    stateCode: "TN",
    website: "https://example.com/riverfront",
    ownerAccountId: seedAccountId,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return {
    store,
    seed: {
      accountId: seedAccountId,
      listingId: seedListingId
    }
  };
}
