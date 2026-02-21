import {
  IdempotencyStore,
  mapStripeEventToStatus
} from "../../../packages/shared-core/src/index.js";

const idempotency = new IdempotencyStore();

export function processStripeWebhook(event) {
  if (!event?.id || !event?.type) {
    throw new Error("invalid webhook event");
  }

  if (!idempotency.claim(event.id)) {
    return { ignored: true, reason: "duplicate_event" };
  }

  const mappedStatus = mapStripeEventToStatus(event.type);
  return {
    ignored: false,
    mappedStatus,
    organizationId: event.data?.object?.metadata?.organizationId ?? null,
    receivedAt: new Date().toISOString()
  };
}
