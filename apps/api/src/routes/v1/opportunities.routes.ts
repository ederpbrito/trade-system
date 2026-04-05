import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import type { OpportunitiesPreviewService } from "../../services/opportunities/opportunities-preview.service.js";
import { sendError } from "../../shared/errors.js";

export type OpportunitiesRoutesOptions = {
  opportunitiesPreview: OpportunitiesPreviewService;
};

const opportunitiesRoutes: FastifyPluginAsync<OpportunitiesRoutesOptions> = async (app, opts) => {
  app.get("/api/v1/opportunities/candidates/preview", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) {
      return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);
    }
    const preview = await opts.opportunitiesPreview.preview((meta) => {
      request.log?.info(meta);
    });
    return reply.send(preview);
  });
};

export default fp(opportunitiesRoutes, { name: "opportunities-routes" });
