import { AppError } from "./errors.js";

export async function readJsonBody(req, { maxBytes = 1_000_000 } = {}) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      throw new AppError("Request body too large", {
        code: "PAYLOAD_TOO_LARGE",
        statusCode: 413
      });
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw);
  } catch {
    throw new AppError("Invalid JSON body", {
      code: "INVALID_JSON",
      statusCode: 400
    });
  }
}

export function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body)
  });
  res.end(body);
}

export function matchPath(pathname, template) {
  const pathSegments = pathname.split("/").filter(Boolean);
  const templateSegments = template.split("/").filter(Boolean);
  if (pathSegments.length !== templateSegments.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < templateSegments.length; i += 1) {
    const segment = templateSegments[i];
    const value = pathSegments[i];
    if (segment.startsWith(":")) {
      params[segment.slice(1)] = decodeURIComponent(value);
      continue;
    }
    if (segment !== value) {
      return null;
    }
  }
  return params;
}

export function withErrorBoundary(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof AppError) {
        sendJson(res, error.statusCode, {
          error: error.code,
          message: error.message,
          details: error.details
        });
        return;
      }

      sendJson(res, 500, {
        error: "INTERNAL_ERROR",
        message: "Unexpected server error"
      });
    }
  };
}
