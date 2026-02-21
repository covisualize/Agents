export class AppError extends Error {
  constructor(message, { code = "APP_ERROR", statusCode = 400, details = null } = {}) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function invariant(condition, message, options) {
  if (!condition) {
    throw new AppError(message, options);
  }
}
