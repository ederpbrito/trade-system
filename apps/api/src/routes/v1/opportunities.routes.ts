import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import type { OpportunitiesCandidatesService } from "../../services/opportunities/opportunities-candidates.service.js";
import type { OpportunitiesPreviewService } from "../../services/opportunities/opportunities-preview.service.js";
import { sortOpportunityCandidates, sortCandidatesByPolicy } from "../../services/opportunities/candidate-sort.js";
import type { RankingPolicyService } from "../../services/ranking-policy/ranking-policy.service.js";
import { sendError } from "../../shared/errors.js";

export type OpportunitiesRoutesOptions = {
  opportunitiesPreview: OpportunitiesPreviewService;
  opportunitiesCandidates: OpportunitiesCandidatesService;
  rankingPolicyService?: RankingPolicyService;
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

    // FR21 — aplicar política versionada se disponível e sort=policy
    const activePolicy = opts.rankingPolicyService ? await opts.rankingPolicyService.getActive() : null;
    const sorted =
      q.sort === "policy" && activePolicy
        ? sortCandidatesByPolicy(candidates, activePolicy.weights)
        : sortOpportunityCandidates(candidates, sortBy);

    return reply.send({
      candidates: sorted,
      suppressionReason,
      policy,
      sortBy: q.sort === "policy" && activePolicy ? "policy" : sortBy,
      rankingPolicy: activePolicy ? { version: activePolicy.version, name: activePolicy.name } : null,
    });
  });
};

export default fp(opportunitiesRoutes, { name: "opportunities-routes" });
