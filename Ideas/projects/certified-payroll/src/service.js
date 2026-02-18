import {
  AppError,
  SubscriptionStatus,
  WorkspaceRole,
  assertAllowedRole,
  createAuditEvent,
  hasEntitlement,
  invariant,
  newId
} from "../../../packages/shared-core/src/index.js";
import { CorrectionReasonCode, PayrollRunStatus, ReportStatus } from "./types.js";

function membershipKey(organizationId, userId) {
  return `${organizationId}:${userId}`;
}

export class CertifiedPayrollService {
  constructor(store) {
    this.store = store;
  }

  getSeed() {
    const [organizationId] = this.store.organizations.keys();
    const [ownerUserId] = this.store.users.keys();
    return { organizationId, ownerUserId };
  }

  setSubscriptionStatus(organizationId, status) {
    const existing = this.store.subscriptionsByOrganization.get(organizationId);
    invariant(existing, "Organization subscription not found", {
      code: "SUBSCRIPTION_NOT_FOUND",
      statusCode: 404
    });
    existing.status = status;
    existing.updatedAt = new Date().toISOString();
    return existing;
  }

  createProject(input, actor) {
    const { organizationId, name, contractNumber } = input;
    invariant(organizationId && name, "organizationId and name are required", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
    this.#assertProjectWriteAllowed(organizationId, actor);

    const project = {
      id: newId("project"),
      organizationId,
      name,
      contractNumber: contractNumber ?? null,
      createdAt: new Date().toISOString()
    };
    this.store.projects.set(project.id, project);
    this.#logAudit(
      createAuditEvent({
        actorId: actor.userId,
        action: "project.created",
        resourceType: "project",
        resourceId: project.id,
        metadata: { organizationId }
      })
    );

    return project;
  }

  addWorker(projectId, input, actor) {
    const project = this.#getProject(projectId);
    this.#assertProjectWriteAllowed(project.organizationId, actor);
    invariant(input?.fullName && input?.classification, "fullName and classification are required", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });

    const worker = {
      id: newId("worker"),
      projectId,
      fullName: input.fullName,
      classification: input.classification,
      fringeRate: Number(input.fringeRate ?? 0),
      createdAt: new Date().toISOString()
    };
    this.store.workers.set(worker.id, worker);
    return worker;
  }

  addTimesheetEntry(projectId, input, actor) {
    const project = this.#getProject(projectId);
    this.#assertProjectWriteAllowed(project.organizationId, actor);
    invariant(input?.workerId && input?.workDate, "workerId and workDate are required", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
    invariant(this.store.workers.has(input.workerId), "Worker not found", {
      code: "WORKER_NOT_FOUND",
      statusCode: 404
    });

    const hours = Number(input.hours ?? 0);
    const wageRate = Number(input.wageRate ?? 0);
    invariant(hours > 0 && wageRate > 0, "hours and wageRate must be positive", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });

    const entry = {
      id: newId("time"),
      projectId,
      workerId: input.workerId,
      workDate: input.workDate,
      hours,
      wageRate,
      createdAt: new Date().toISOString()
    };
    this.store.timesheetEntries.set(entry.id, entry);
    return entry;
  }

  generatePayrollRun(input, actor) {
    const project = this.#getProject(input.projectId);
    this.#assertProjectWriteAllowed(project.organizationId, actor);
    invariant(input?.periodStart && input?.periodEnd, "periodStart and periodEnd are required", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });

    const start = new Date(input.periodStart);
    const end = new Date(input.periodEnd);
    invariant(!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()), "Invalid period dates", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
    invariant(start <= end, "periodStart must be before or equal to periodEnd", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });

    const entries = [...this.store.timesheetEntries.values()].filter((entry) => {
      if (entry.projectId !== project.id) {
        return false;
      }
      const workDate = new Date(entry.workDate);
      return workDate >= start && workDate <= end;
    });

    invariant(entries.length > 0, "No timesheet entries found for period", {
      code: "TIMESHEETS_NOT_FOUND",
      statusCode: 422
    });

    const totalsByWorker = new Map();
    let grossWages = 0;
    for (const entry of entries) {
      const current = totalsByWorker.get(entry.workerId) ?? { hours: 0, wages: 0 };
      current.hours += entry.hours;
      current.wages += entry.hours * entry.wageRate;
      totalsByWorker.set(entry.workerId, current);
      grossWages += entry.hours * entry.wageRate;
    }

    const payrollRun = {
      id: newId("run"),
      projectId: project.id,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      status: PayrollRunStatus.DRAFT,
      createdBy: actor.userId,
      totals: {
        entryCount: entries.length,
        workerCount: totalsByWorker.size,
        grossWages: Number(grossWages.toFixed(2))
      },
      workerSummaries: [...totalsByWorker.entries()].map(([workerId, summary]) => ({
        workerId,
        totalHours: Number(summary.hours.toFixed(2)),
        totalWages: Number(summary.wages.toFixed(2))
      })),
      createdAt: new Date().toISOString()
    };
    this.store.payrollRuns.set(payrollRun.id, payrollRun);

    const report = {
      id: newId("report"),
      payrollRunId: payrollRun.id,
      revision: 1,
      status: ReportStatus.DRAFT,
      submittedAt: null,
      createdAt: new Date().toISOString()
    };
    this.store.complianceReports.set(report.id, report);

    this.#logAudit(
      createAuditEvent({
        actorId: actor.userId,
        action: "payroll_run.generated",
        resourceType: "payroll_run",
        resourceId: payrollRun.id,
        metadata: { projectId: project.id, reportId: report.id }
      })
    );

    return { payrollRun, report };
  }

  submitReport(reportId, actor) {
    const report = this.#getReport(reportId);
    const run = this.#getRun(report.payrollRunId);
    const project = this.#getProject(run.projectId);
    this.#assertProjectWriteAllowed(project.organizationId, actor);

    report.status = ReportStatus.SUBMITTED;
    report.submittedAt = new Date().toISOString();
    run.status = PayrollRunStatus.SUBMITTED;

    this.#logAudit(
      createAuditEvent({
        actorId: actor.userId,
        action: "report.submitted",
        resourceType: "report",
        resourceId: report.id,
        metadata: { payrollRunId: run.id }
      })
    );

    return report;
  }

  rejectReport(reportId, input, actor) {
    const report = this.#getReport(reportId);
    const run = this.#getRun(report.payrollRunId);
    const project = this.#getProject(run.projectId);
    this.#assertProjectWriteAllowed(project.organizationId, actor);

    invariant(input?.notes, "notes are required", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
    const reasonCode = input.reasonCode ?? CorrectionReasonCode.OTHER;
    invariant(Object.values(CorrectionReasonCode).includes(reasonCode), "Invalid reasonCode", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });

    report.status = ReportStatus.REJECTED;
    run.status = PayrollRunStatus.REJECTED;

    const rejection = {
      id: newId("reject"),
      complianceReportId: report.id,
      reasonCode,
      notes: input.notes,
      createdBy: actor.userId,
      createdAt: new Date().toISOString()
    };
    this.store.reportRejections.set(rejection.id, rejection);

    const nextRevision = {
      id: newId("report"),
      payrollRunId: run.id,
      revision: report.revision + 1,
      status: ReportStatus.DRAFT,
      submittedAt: null,
      createdAt: new Date().toISOString()
    };
    this.store.complianceReports.set(nextRevision.id, nextRevision);
    run.status = PayrollRunStatus.CORRECTED;

    this.#logAudit(
      createAuditEvent({
        actorId: actor.userId,
        action: "report.rejected",
        resourceType: "report",
        resourceId: report.id,
        metadata: { nextRevisionId: nextRevision.id }
      })
    );

    return { rejection, nextRevision };
  }

  listPayrollRuns(projectId, actor) {
    const project = this.#getProject(projectId);
    this.#assertProjectReadAllowed(project.organizationId, actor);
    return [...this.store.payrollRuns.values()].filter((run) => run.projectId === projectId);
  }

  getReport(reportId, actor) {
    const report = this.#getReport(reportId);
    const run = this.#getRun(report.payrollRunId);
    const project = this.#getProject(run.projectId);
    this.#assertProjectReadAllowed(project.organizationId, actor);
    return report;
  }

  processStripeWebhook(event) {
    invariant(event?.id && event?.type, "Invalid webhook event", {
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
    if (this.store.webhookEvents.has(event.id)) {
      return { ignored: true, reason: "duplicate_event" };
    }

    this.store.webhookEvents.add(event.id);
    const organizationId = event.data?.object?.metadata?.organizationId;
    const status = this.#mapStripeEventToStatus(event.type);
    if (organizationId && status) {
      const subscription = this.store.subscriptionsByOrganization.get(organizationId);
      if (subscription) {
        subscription.status = status;
        subscription.updatedAt = new Date().toISOString();
      }
    }
    return { ignored: false, organizationId, status };
  }

  #mapStripeEventToStatus(eventType) {
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

  #getProject(projectId) {
    const project = this.store.projects.get(projectId);
    invariant(project, "Project not found", { code: "PROJECT_NOT_FOUND", statusCode: 404 });
    return project;
  }

  #getRun(runId) {
    const run = this.store.payrollRuns.get(runId);
    invariant(run, "Payroll run not found", { code: "RUN_NOT_FOUND", statusCode: 404 });
    return run;
  }

  #getReport(reportId) {
    const report = this.store.complianceReports.get(reportId);
    invariant(report, "Compliance report not found", { code: "REPORT_NOT_FOUND", statusCode: 404 });
    return report;
  }

  #assertProjectWriteAllowed(organizationId, actor) {
    this.#assertMembership(organizationId, actor.userId);
    assertAllowedRole(actor.role, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]);
    this.#assertEntitlement(organizationId);
  }

  #assertProjectReadAllowed(organizationId, actor) {
    this.#assertMembership(organizationId, actor.userId);
  }

  #assertMembership(organizationId, userId) {
    invariant(this.store.memberships.has(membershipKey(organizationId, userId)), "User is not in organization", {
      code: "FORBIDDEN",
      statusCode: 403
    });
  }

  #assertEntitlement(organizationId) {
    const subscription = this.store.subscriptionsByOrganization.get(organizationId);
    invariant(subscription, "Subscription missing", {
      code: "SUBSCRIPTION_NOT_FOUND",
      statusCode: 404
    });
    if (!hasEntitlement(subscription.status)) {
      throw new AppError("Active subscription required", {
        code: "PAYMENT_REQUIRED",
        statusCode: 402,
        details: { status: subscription.status }
      });
    }
  }

  #logAudit(event) {
    this.store.auditLogs.push(event);
  }
}
