import type { FastifyPluginAsync } from "fastify";

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/v1/health", async () => {
    return { ok: true };
  });
};

export default healthRoutes;
