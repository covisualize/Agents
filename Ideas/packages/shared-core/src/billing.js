export const SubscriptionStatus = Object.freeze({
  ACTIVE: "active",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
  INCOMPLETE: "incomplete"
});

const ENTITLED = new Set([SubscriptionStatus.ACTIVE]);

export function hasEntitlement(subscriptionStatus) {
  return ENTITLED.has(subscriptionStatus);
}

export function mapStripeEventToStatus(eventType) {
  switch (eventType) {
    case "invoice.paid":
      return SubscriptionStatus.ACTIVE;
    case "invoice.payment_failed":
      return SubscriptionStatus.PAST_DUE;
    case "customer.subscription.deleted":
      return SubscriptionStatus.CANCELED;
    case "customer.subscription.updated":
      return null;
    default:
      return null;
  }
}
