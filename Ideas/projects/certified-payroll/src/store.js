import { SubscriptionStatus, WorkspaceRole, newId } from "../../../packages/shared-core/src/index.js";

export function createCertifiedPayrollStore() {
  const store = {
    organizations: new Map(),
    users: new Map(),
    memberships: new Map(),
    subscriptionsByOrganization: new Map(),
    projects: new Map(),
    workers: new Map(),
    timesheetEntries: new Map(),
    payrollRuns: new Map(),
    complianceReports: new Map(),
    reportRejections: new Map(),
    webhookEvents: new Set(),
    auditLogs: []
  };

  const organizationId = newId("org");
  const ownerUserId = newId("user");

  store.organizations.set(organizationId, {
    id: organizationId,
    name: "Demo Contractor LLC",
    createdAt: new Date().toISOString()
  });
  store.users.set(ownerUserId, {
    id: ownerUserId,
    email: "owner@demo-contractor.com",
    createdAt: new Date().toISOString()
  });
  store.memberships.set(`${organizationId}:${ownerUserId}`, {
    organizationId,
    userId: ownerUserId,
    role: WorkspaceRole.OWNER
  });
  store.subscriptionsByOrganization.set(organizationId, {
    id: newId("sub"),
    organizationId,
    status: SubscriptionStatus.ACTIVE,
    stripeSubscriptionId: null,
    updatedAt: new Date().toISOString()
  });

  return {
    store,
    seed: {
      organizationId,
      ownerUserId
    }
  };
}
