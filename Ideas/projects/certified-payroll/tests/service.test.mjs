import test from "node:test";
import assert from "node:assert/strict";

import { SubscriptionStatus } from "../../../packages/shared-core/src/index.js";
import { CertifiedPayrollService } from "../src/service.js";
import { createCertifiedPayrollStore } from "../src/store.js";

function buildCtx() {
  const { store, seed } = createCertifiedPayrollStore();
  const service = new CertifiedPayrollService(store);
  return {
    service,
    actor: {
      userId: seed.ownerUserId,
      role: "owner"
    },
    organizationId: seed.organizationId
  };
}

test("create project requires active entitlement", () => {
  const { service, actor, organizationId } = buildCtx();
  service.setSubscriptionStatus(organizationId, SubscriptionStatus.PAST_DUE);
  assert.throws(
    () => service.createProject({ organizationId, name: "I-95 Expansion" }, actor),
    (error) => error.statusCode === 402
  );
});

test("generate payroll run aggregates worker totals", () => {
  const { service, actor, organizationId } = buildCtx();
  const project = service.createProject({ organizationId, name: "Bridge Retrofit" }, actor);
  const worker = service.addWorker(project.id, { fullName: "Alex Baker", classification: "Carpenter" }, actor);

  service.addTimesheetEntry(
    project.id,
    { workerId: worker.id, workDate: "2026-02-01", hours: 8, wageRate: 45 },
    actor
  );
  service.addTimesheetEntry(
    project.id,
    { workerId: worker.id, workDate: "2026-02-02", hours: 6, wageRate: 45 },
    actor
  );

  const { payrollRun, report } = service.generatePayrollRun(
    { projectId: project.id, periodStart: "2026-02-01", periodEnd: "2026-02-07" },
    actor
  );
  assert.equal(payrollRun.totals.workerCount, 1);
  assert.equal(payrollRun.totals.entryCount, 2);
  assert.equal(payrollRun.totals.grossWages, 630);
  assert.equal(report.revision, 1);
});

test("rejection creates next report revision", () => {
  const { service, actor, organizationId } = buildCtx();
  const project = service.createProject({ organizationId, name: "School Buildout" }, actor);
  const worker = service.addWorker(project.id, { fullName: "Sam Lee", classification: "Electrician" }, actor);
  service.addTimesheetEntry(
    project.id,
    { workerId: worker.id, workDate: "2026-02-03", hours: 7, wageRate: 50 },
    actor
  );
  const generated = service.generatePayrollRun(
    { projectId: project.id, periodStart: "2026-02-01", periodEnd: "2026-02-07" },
    actor
  );
  service.submitReport(generated.report.id, actor);
  const result = service.rejectReport(
    generated.report.id,
    { reasonCode: "classification_mismatch", notes: "Wrong classification on one entry" },
    actor
  );

  assert.equal(result.rejection.reasonCode, "classification_mismatch");
  assert.equal(result.nextRevision.revision, 2);
});

test("stripe webhook is idempotent", () => {
  const { service, organizationId } = buildCtx();
  const event = {
    id: "evt_1",
    type: "invoice.payment_failed",
    data: { object: { metadata: { organizationId } } }
  };
  const first = service.processStripeWebhook(event);
  const second = service.processStripeWebhook(event);
  assert.equal(first.ignored, false);
  assert.equal(second.ignored, true);
});
