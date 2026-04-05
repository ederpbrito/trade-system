import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import type { DataSourcesService } from "../../services/data-sources/data-sources.service.js";
import { sendError } from "../../shared/errors.js";

export type DataSourcesRoutesOptions = {
  dataSources: DataSourcesService;
};

const dataSourcesRoutes: FastifyPluginAsync<DataSourcesRoutesOptions> = async (app, opts) => {
  app.get("/api/v1/data-sources/health", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) {
      return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);
    }
    const data = await opts.dataSources.listHealth();
    return reply.send(data);
  });
};

export default fp(dataSourcesRoutes, { name: "data-sources-routes" });
