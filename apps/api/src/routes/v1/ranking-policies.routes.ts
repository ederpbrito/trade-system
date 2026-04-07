import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import type { RankingPolicyService } from "../../services/ranking-policy/ranking-policy.service.js";
import { sendError } from "../../shared/errors.js";

export type RankingPoliciesRoutesOptions = {
  rankingPolicyService: RankingPolicyService;
};

const rankingPoliciesRoutes: FastifyPluginAsync<RankingPoliciesRoutesOptions> = async (app, opts) => {
  /** FR21 — lista todas as políticas versionadas */
  app.get("/api/v1/ranking-policies", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);

    const policies = await opts.rankingPolicyService.listAll();
    return reply.send({ policies });
  });

  /** FR21 — devolve a política activa com metadados de versão */
  app.get("/api/v1/ranking-policies/active", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);

    const policy = await opts.rankingPolicyService.getActive();
    if (!policy) return sendError(reply, 404, "NOT_FOUND", "Nenhuma política activa.", request.requestId);
    return reply.send({ policy });
  });

  /** FR21 — cria nova versão de política (activa automaticamente) */
  app.post("/api/v1/ranking-policies", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);

    const body = request.body as {
      name?: unknown;
      weights?: { priorityWeight?: unknown; timeWeight?: unknown; horizonBonus?: unknown };
    };

    if (typeof body.name !== "string" || !body.name.trim()) {
      return sendError(reply, 400, "VALIDATION_ERROR", "Campo 'name' obrigatório.", request.requestId);
    }

    const w = body.weights ?? {};
    const priorityWeight = typeof w.priorityWeight === "number" ? w.priorityWeight : 0.5;
    const timeWeight = typeof w.timeWeight === "number" ? w.timeWeight : 0.3;
    const horizonBonus = typeof w.horizonBonus === "number" ? w.horizonBonus : 0.2;

    const policy = await opts.rankingPolicyService.create(body.name.trim(), {
      priorityWeight,
      timeWeight,
      horizonBonus,
    });

    return reply.status(201).send({ policy });
  });
};

export default fp(rankingPoliciesRoutes, { name: "ranking-policies-routes" });
