export function createAuditEvent({
  actorId,
  action,
  resourceType,
  resourceId,
  metadata = {}
}) {
  if (!actorId || !action || !resourceType || !resourceId) {
    throw new Error("Missing required audit event fields");
  }

  return {
    actorId,
    action,
    resourceType,
    resourceId,
    metadata,
    createdAt: new Date().toISOString()
  };
}
