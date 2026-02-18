import { createCertifiedPayrollApp } from "./app.js";

const port = Number(process.env.PORT ?? 4301);
const { server, seed } = createCertifiedPayrollApp();

server.listen(port, () => {
  const bootstrap = {
    actorUserId: seed.ownerUserId,
    actorRole: "owner",
    organizationId: seed.organizationId
  };
  console.log(`[certified-payroll] listening on http://localhost:${port}`);
  console.log(`[certified-payroll] bootstrap ${JSON.stringify(bootstrap)}`);
});
