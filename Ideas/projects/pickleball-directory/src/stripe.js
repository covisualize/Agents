import {
  IdempotencyStore,
  mapStripeEventToStatus
} from "../../../packages/shared-core/src/index.js";

const idempotency = new IdempotencyStore();

export function processSponsorWebhook(event) {
  if (!event?.id || !event?.type) {
    throw new Error("invalid webhook");
  }

  if (!idempotency.claim(event.id)) {
    return { ignored: true };
  }

  return {
    ignored: false,
    status: mapStripeEventToStatus(event.type),
    listingId: event.data?.object?.metadata?.listingId ?? null,
    accountId: event.data?.object?.metadata?.accountId ?? null,
    receivedAt: new Date().toISOString()
  };
}
