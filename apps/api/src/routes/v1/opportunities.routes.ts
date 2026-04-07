import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import type { OpportunitiesCandidatesService } from "../../services/opportunities/opportunities-candidates.service.js";
import type { OpportunitiesPreviewService } from "../../services/opportunities/opportunities-preview.service.js";
import { sortOpportunityCandidates } from "../../services/opportunities/candidate-sort.js";
import { sendError } from "../../shared/errors.js";

export type OpportunitiesRoutesOptions = {
  opportunitiesPreview: OpportunitiesPreviewService;
  opportunitiesCandidates: OpportunitiesCandidatesService;
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

  app.get("/api/v1/opportunities/candidates", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) {
      return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);
    }
    const q = request.query as { sort?: string };
    const sortBy = q.sort === "time" ? "time" : "priority";
    const { candidates, suppressionReason, policy } = await opts.opportunitiesCandidates.listForUser(userId, (meta) => {
      request.log?.info(meta);
    });
    const sorted = sortOpportunityCandidates(candidates, sortBy);
    return reply.send({
      candidates: sorted,
      suppressionReason,
      policy,
      sortBy,
    });
  });
};

export default fp(opportunitiesRoutes, { name: "opportunities-routes" });
