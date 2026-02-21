import { AppError } from "./errors.js";

export const WorkspaceRole = Object.freeze({
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member"
});

export function assertAllowedRole(role, allowedRoles) {
  if (!allowedRoles.includes(role)) {
    throw new AppError("Insufficient permissions", {
      code: "FORBIDDEN",
      statusCode: 403,
      details: { role, allowedRoles }
    });
  }
}
