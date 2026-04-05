import { loadEnv } from "./config/env.js";
import { buildAppForServer } from "./app.js";

const env = loadEnv();
const app = await buildAppForServer(env);

const port = env.API_PORT;
await app.listen({ port, host: "0.0.0.0" });
app.log.info(`API a escutar em http://localhost:${port}`);
