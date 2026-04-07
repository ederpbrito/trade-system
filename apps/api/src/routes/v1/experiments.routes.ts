import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import type { ExperimentsService } from "../../services/experiments/experiments.service.js";
import { sendError } from "../../shared/errors.js";

export type ExperimentsRoutesOptions = {
  experimentsService: ExperimentsService;
};

const experimentsRoutes: FastifyPluginAsync<ExperimentsRoutesOptions> = async (app, opts) => {
  /** FR23/FR24 — lista experimentos do utilizador */
  app.get("/api/v1/experiments", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);

    const experiments = await opts.experimentsService.listForUser(userId);
    return reply.send({ experiments });
  });

  /** FR23 — detalhe de um experimento com versão de política, dataset hash e métricas */
  app.get("/api/v1/experiments/:id", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);

    const { id } = request.params as { id: string };
    const experiment = await opts.experimentsService.getById(id);
    if (!experiment) return sendError(reply, 404, "NOT_FOUND", "Experimento não encontrado.", request.requestId);
    if (experiment.userId !== userId) return sendError(reply, 403, "FORBIDDEN", "Acesso negado.", request.requestId);
    return reply.send({ experiment });
  });
};

export default fp(experimentsRoutes, { name: "experiments-routes" });
