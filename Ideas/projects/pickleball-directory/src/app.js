import { createServer } from "node:http";
import { withErrorBoundary } from "../../../packages/shared-core/src/index.js";
import { createDirectoryApi } from "./api.js";
import { PickleballDirectoryService } from "./service.js";
import { createDirectoryStore } from "./store.js";

export function createDirectoryApp() {
  const { store, seed } = createDirectoryStore();
  const service = new PickleballDirectoryService(store);
  const handler = withErrorBoundary(createDirectoryApi(service));
  const server = createServer((req, res) => handler(req, res));

  return {
    server,
    service,
    seed
  };
}
