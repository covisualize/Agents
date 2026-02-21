import {
  AppError,
  SubscriptionStatus,
  createAuditEvent,
  hasEntitlement,
  invariant,
  newId
} from "../../../packages/shared-core/src/index.js";
import { ListingType, SubmissionStatus } from "./types.js";

export class PickleballDirectoryService {
  constructor(store) {
    this.store = store;
  }

  getSeed() {
    const [accountId] = this.store.accountSubscriptions.keys();
    const [listingId] = this.store.listings.keys();
    return { accountId, listingId };
  }

  setSubscriptionStatus(accountId, status) {
    const subscription = this.store.accountSubscriptions.get(accountId);
    invariant(subscription, "Account subscription not found", {
      code: "SUBSCRIPTION_NOT_FOUND",
      statusCode: 404
    });
    subscription.status = status;
    subscription.updatedAt = new Date().toISOString();
    return subscription;
  }

  queryListings(query) {
    const metro = query?.metro?.toLowerCase();
    const type = query?.type;
    const search = query?.search?.toLowerCase();
    const limit = Math.max(1, Math.min(100, Number(query?.limit ?? 25)));
    const offset = Math.max(0, Number(query?.offset ?? 0));

    const filtered = [...this.store.listings.values()].filter((listing) => {
      if (!listing.isActive) {
        return false;
      }
      if (metro && listing.metro !== metro) {
        return false;
      }
      if (type && listing.listingType !== type) {
        return false;
      }
      if (search && !`${listing.name} ${listing.metro}`.toLowerCase().includes(search)) {
        return false;
      }
      return true;
    });

    const sponsoredNow = new Set(
      [...this.store.sponsoredSlots.values()]
        .filter((slot) => new Date(slot.startsAt) <= new Date() && new Date(slot.endsAt) >= new Date())
        .map((slot) => slot.listingId)
    );

    filtered.sort((a, b) => {
      const aSponsored = sponsoredNow.has(a.id) ? 1 : 0;
      const bSponsored = sponsoredNow.has(b.id) ? 1 : 0;
      if (aSponsored !== bSponsored) {
        return bSponsored - aSponsored;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      total: filtered.length,
      results: filtered.slice(offset, offset + limit)
    };
  }

  createSubmission(input, actor = { actorId: "anonymous" }) {
    invariant(input?.name && input?.metro && input?.listingType, "name, metro and listingType are required", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
    invariant(Object.values(ListingType).includes(input.listingType), "Invalid listingType", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });

    const submission = {
      id: newId("submission"),
      name: input.name,
      metro: input.metro.toLowerCase(),
      listingType: input.listingType,
      website: input.website ?? null,
      submittedByEmail: input.submittedByEmail ?? null,
      status: SubmissionStatus.PENDING,
      createdAt: new Date().toISOString()
    };
    this.store.submissions.set(submission.id, submission);

    this.#logAudit(
      createAuditEvent({
        actorId: actor.actorId,
        action: "submission.created",
        resourceType: "submission",
        resourceId: submission.id
      })
    );
    return submission;
  }

  createClaim(listingId, input, actor = { actorId: "anonymous" }) {
    const listing = this.#getListing(listingId);
    invariant(input?.claimantEmail && input?.verificationNote, "claimantEmail and verificationNote are required", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });

    const claim = {
      id: newId("claim"),
      listingId: listing.id,
      claimantEmail: input.claimantEmail,
      verificationNote: input.verificationNote,
      status: SubmissionStatus.PENDING,
      createdAt: new Date().toISOString(),
      resolvedAt: null
    };
    this.store.listingClaims.set(claim.id, claim);
    this.#logAudit(
      createAuditEvent({
        actorId: actor.actorId,
        action: "listing.claimed",
        resourceType: "listing_claim",
        resourceId: claim.id,
        metadata: { listingId }
      })
    );
    return claim;
  }

  resolveClaim(claimId, decision, actor = { actorId: "system" }) {
    const claim = this.store.listingClaims.get(claimId);
    invariant(claim, "Claim not found", { code: "CLAIM_NOT_FOUND", statusCode: 404 });
    invariant(["approved", "rejected"].includes(decision), "decision must be approved or rejected", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });

    claim.status = decision;
    claim.resolvedAt = new Date().toISOString();

    if (decision === "approved") {
      const listing = this.#getListing(claim.listingId);
      if (!listing.ownerAccountId) {
        listing.ownerAccountId = newId("acct");
        this.store.accountSubscriptions.set(listing.ownerAccountId, {
          accountId: listing.ownerAccountId,
          status: SubscriptionStatus.INCOMPLETE,
          updatedAt: new Date().toISOString()
        });
      }
    }

    this.#logAudit(
      createAuditEvent({
        actorId: actor.actorId,
        action: "listing_claim.resolved",
        resourceType: "listing_claim",
        resourceId: claim.id,
        metadata: { decision }
      })
    );
    return claim;
  }

  enableSponsoredListing(listingId, input, actor = { actorId: "system" }) {
    const listing = this.#getListing(listingId);
    const accountId = input?.accountId ?? listing.ownerAccountId;
    invariant(accountId, "Listing has no owner account", {
      code: "ACCOUNT_REQUIRED",
      statusCode: 400
    });

    const subscription = this.store.accountSubscriptions.get(accountId);
    invariant(subscription, "Subscription not found for account", {
      code: "SUBSCRIPTION_NOT_FOUND",
      statusCode: 404
    });
    if (!hasEntitlement(subscription.status)) {
      throw new AppError("Active subscription required for sponsorship", {
        code: "PAYMENT_REQUIRED",
        statusCode: 402,
        details: { status: subscription.status }
      });
    }

    const start = new Date(input?.startsAt ?? new Date().toISOString());
    const end = new Date(input?.endsAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
    invariant(start < end, "startsAt must be before endsAt", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });

    const slot = {
      id: newId("slot"),
      listingId,
      metro: listing.metro,
      category: listing.listingType,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      createdAt: new Date().toISOString()
    };
    this.store.sponsoredSlots.set(slot.id, slot);
    this.#logAudit(
      createAuditEvent({
        actorId: actor.actorId,
        action: "sponsorship.enabled",
        resourceType: "sponsored_slot",
        resourceId: slot.id,
        metadata: { listingId }
      })
    );
    return slot;
  }

  runIngestion(input, actor = { actorId: "system" }) {
    invariant(input?.source, "source is required", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
    const run = {
      id: newId("ingest"),
      source: input.source,
      runStartedAt: new Date().toISOString(),
      runFinishedAt: null,
      recordsProcessed: 0,
      recordsFailed: 0
    };

    for (const record of input.records ?? []) {
      const valid = record?.name && record?.metro && record?.listingType;
      if (!valid || !Object.values(ListingType).includes(record.listingType)) {
        run.recordsFailed += 1;
        continue;
      }

      const existing = [...this.store.listings.values()].find(
        (listing) =>
          listing.name.toLowerCase() === record.name.toLowerCase() &&
          listing.metro === record.metro.toLowerCase() &&
          listing.listingType === record.listingType
      );

      if (existing) {
        existing.website = record.website ?? existing.website;
        existing.updatedAt = new Date().toISOString();
      } else {
        const listing = {
          id: newId("listing"),
          listingType: record.listingType,
          name: record.name,
          metro: record.metro.toLowerCase(),
          stateCode: record.stateCode ?? null,
          website: record.website ?? null,
          ownerAccountId: record.ownerAccountId ?? null,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.store.listings.set(listing.id, listing);
      }
      run.recordsProcessed += 1;
    }

    run.runFinishedAt = new Date().toISOString();
    this.store.ingestionRuns.set(run.id, run);
    this.#logAudit(
      createAuditEvent({
        actorId: actor.actorId,
        action: "ingestion.completed",
        resourceType: "ingestion_run",
        resourceId: run.id,
        metadata: { source: run.source }
      })
    );
    return run;
  }

  processStripeWebhook(event) {
    invariant(event?.id && event?.type, "Invalid webhook event", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
    if (this.store.webhookEvents.has(event.id)) {
      return { ignored: true };
    }
    this.store.webhookEvents.add(event.id);

    const accountId = event.data?.object?.metadata?.accountId;
    const status = this.#mapStripeStatus(event.type);
    if (accountId && status) {
      const existing = this.store.accountSubscriptions.get(accountId);
      if (existing) {
        existing.status = status;
        existing.updatedAt = new Date().toISOString();
      } else {
        this.store.accountSubscriptions.set(accountId, {
          accountId,
          status,
          updatedAt: new Date().toISOString()
        });
      }
    }
    return { ignored: false, accountId, status };
  }

  #mapStripeStatus(eventType) {
    switch (eventType) {
      case "invoice.paid":
        return SubscriptionStatus.ACTIVE;
      case "invoice.payment_failed":
        return SubscriptionStatus.PAST_DUE;
      case "customer.subscription.deleted":
        return SubscriptionStatus.CANCELED;
      default:
        return null;
    }
  }

  #getListing(listingId) {
    const listing = this.store.listings.get(listingId);
    invariant(listing, "Listing not found", {
      code: "LISTING_NOT_FOUND",
      statusCode: 404
    });
    return listing;
  }

  #logAudit(event) {
    this.store.auditLogs.push(event);
  }
}
