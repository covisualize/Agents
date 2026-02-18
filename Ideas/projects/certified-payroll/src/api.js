import { AppError, matchPath, readJsonBody, sendJson } from "../../../packages/shared-core/src/index.js";

function getActor(query, body) {
  return {
    userId: body?.actorUserId ?? query.get("actorUserId"),
    role: body?.actorRole ?? query.get("actorRole")
  };
}

export function createCertifiedPayrollApi(service) {
  return async function handleRequest(req, res) {
    const url = new URL(req.url, "http://localhost");
    const { pathname, searchParams } = url;

    if (req.method === "GET" && pathname === "/health") {
      sendJson(res, 200, { ok: true, service: "certified-payroll" });
      return;
    }

    if (req.method === "GET" && pathname === "/api/bootstrap") {
      sendJson(res, 200, service.getSeed());
      return;
    }

    if (req.method === "POST" && pathname === "/api/projects") {
      const body = await readJsonBody(req);
      const project = service.createProject(body, getActor(searchParams, body));
      sendJson(res, 201, { project });
      return;
    }

    const workerRoute = matchPath(pathname, "/api/projects/:projectId/workers");
    if (req.method === "POST" && workerRoute) {
      const body = await readJsonBody(req);
      const worker = service.addWorker(workerRoute.projectId, body, getActor(searchParams, body));
      sendJson(res, 201, { worker });
      return;
    }

    const timesheetRoute = matchPath(pathname, "/api/projects/:projectId/timesheets");
    if (req.method === "POST" && timesheetRoute) {
      const body = await readJsonBody(req);
      const entry = service.addTimesheetEntry(timesheetRoute.projectId, body, getActor(searchParams, body));
      sendJson(res, 201, { entry });
      return;
    }

    if (req.method === "POST" && pathname === "/api/payroll-runs/generate") {
      const body = await readJsonBody(req);
      const result = service.generatePayrollRun(body, getActor(searchParams, body));
      sendJson(res, 201, result);
      return;
    }

    const runsRoute = matchPath(pathname, "/api/projects/:projectId/payroll-runs");
    if (req.method === "GET" && runsRoute) {
      const runs = service.listPayrollRuns(runsRoute.projectId, {
        userId: searchParams.get("actorUserId"),
        role: searchParams.get("actorRole")
      });
      sendJson(res, 200, { runs });
      return;
    }

    const submitRoute = matchPath(pathname, "/api/reports/:reportId/submit");
    if (req.method === "POST" && submitRoute) {
      const body = await readJsonBody(req);
      const report = service.submitReport(submitRoute.reportId, getActor(searchParams, body));
      sendJson(res, 200, { report });
      return;
    }

    const rejectRoute = matchPath(pathname, "/api/reports/:reportId/rejections");
    if (req.method === "POST" && rejectRoute) {
      const body = await readJsonBody(req);
      const result = service.rejectReport(rejectRoute.reportId, body, getActor(searchParams, body));
      sendJson(res, 201, result);
      return;
    }

    const reportRoute = matchPath(pathname, "/api/reports/:reportId");
    if (req.method === "GET" && reportRoute) {
      const report = service.getReport(reportRoute.reportId, {
        userId: searchParams.get("actorUserId"),
        role: searchParams.get("actorRole")
      });
      sendJson(res, 200, { report });
      return;
    }

    if (req.method === "POST" && pathname === "/api/webhooks/stripe") {
      const body = await readJsonBody(req);
      const result = service.processStripeWebhook(body);
      sendJson(res, 200, result);
      return;
    }

    throw new AppError("Route not found", { code: "NOT_FOUND", statusCode: 404 });
  };
}
