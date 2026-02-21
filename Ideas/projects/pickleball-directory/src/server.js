import { createDirectoryApp } from "./app.js";

const port = Number(process.env.PORT ?? 4302);
const { server, seed } = createDirectoryApp();

server.listen(port, () => {
  console.log(`[pickleball-directory] listening on http://localhost:${port}`);
  console.log(`[pickleball-directory] bootstrap ${JSON.stringify(seed)}`);
});
