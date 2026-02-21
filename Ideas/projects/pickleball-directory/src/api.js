import { AppError, matchPath, readJsonBody, sendJson } from "../../../packages/shared-core/src/index.js";

function getActor(searchParams, body) {
  return {
    actorId: body?.actorId ?? searchParams.get("actorId") ?? "anonymous"
  };
}

export function createDirectoryApi(service) {
  return async function handleRequest(req, res) {
    const url = new URL(req.url, "http://localhost");
    const { pathname, searchParams } = url;

    if (req.method === "GET" && pathname === "/health") {
      sendJson(res, 200, { ok: true, service: "pickleball-directory" });
      return;
    }

    if (req.method === "GET" && pathname === "/api/bootstrap") {
      sendJson(res, 200, service.getSeed());
      return;
    }

    if (req.method === "GET" && pathname === "/api/listings") {
      const result = service.queryListings({
        metro: searchParams.get("metro"),
        type: searchParams.get("type"),
        search: searchParams.get("search"),
        limit: searchParams.get("limit"),
        offset: searchParams.get("offset")
      });
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "POST" && pathname === "/api/submissions") {
      const body = await readJsonBody(req);
      const submission = service.createSubmission(body, getActor(searchParams, body));
      sendJson(res, 201, { submission });
      return;
    }

    const claimRoute = matchPath(pathname, "/api/listings/:listingId/claim");
    if (req.method === "POST" && claimRoute) {
      const body = await readJsonBody(req);
      const claim = service.createClaim(claimRoute.listingId, body, getActor(searchParams, body));
      sendJson(res, 202, { claim });
      return;
    }

    const resolveRoute = matchPath(pathname, "/api/claims/:claimId/resolve");
    if (req.method === "POST" && resolveRoute) {
      const body = await readJsonBody(req);
      const claim = service.resolveClaim(resolveRoute.claimId, body?.decision, getActor(searchParams, body));
      sendJson(res, 200, { claim });
      return;
    }

    const featureRoute = matchPath(pathname, "/api/listings/:listingId/feature");
    if (req.method === "POST" && featureRoute) {
      const body = await readJsonBody(req);
      const slot = service.enableSponsoredListing(featureRoute.listingId, body, getActor(searchParams, body));
      sendJson(res, 200, { slot });
      return;
    }

    if (req.method === "POST" && pathname === "/api/listings/ingest") {
      const body = await readJsonBody(req);
      const run = service.runIngestion(body, getActor(searchParams, body));
      sendJson(res, 200, { run });
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
