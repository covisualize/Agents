import { createServer } from "node:http";
import { withErrorBoundary } from "../../../packages/shared-core/src/index.js";
import { createCertifiedPayrollApi } from "./api.js";
import { CertifiedPayrollService } from "./service.js";
import { createCertifiedPayrollStore } from "./store.js";

export function createCertifiedPayrollApp() {
  const { store, seed } = createCertifiedPayrollStore();
  const service = new CertifiedPayrollService(store);
  const handler = withErrorBoundary(createCertifiedPayrollApi(service));
  const server = createServer((req, res) => handler(req, res));

  return {
    server,
    service,
    seed
  };
}
