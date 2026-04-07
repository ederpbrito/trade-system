import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import type { TrainingJobService } from "../../services/training/training-job.service.js";
import type { TradingModeService } from "../../services/trading-mode/trading-mode.service.js";
import { sendError } from "../../shared/errors.js";

export type TrainingJobsRoutesOptions = {
  trainingJobService: TrainingJobService;
  tradingModeService: TradingModeService;
};

const trainingJobsRoutes: FastifyPluginAsync<TrainingJobsRoutesOptions> = async (app, opts) => {
  /** FR22 — lista jobs de treino do utilizador */
  app.get("/api/v1/training-jobs", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);

    const jobs = await opts.trainingJobService.listForUser(userId);
    return reply.send({ jobs });
  });

  /** FR22 — estado de um job específico */
  app.get("/api/v1/training-jobs/:id", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);

    const { id } = request.params as { id: string };
    const job = await opts.trainingJobService.getStatus(id);
    if (!job) return sendError(reply, 404, "NOT_FOUND", "Job não encontrado.", request.requestId);
    if (job.userId !== userId) return sendError(reply, 403, "FORBIDDEN", "Acesso negado.", request.requestId);
    return reply.send({ job });
  });

  /** FR22 — inicia ciclo de treino/avaliação em paper/demo */
  app.post("/api/v1/training-jobs", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);

    if (opts.tradingModeService.currentMode !== "demo") {
      return sendError(
        reply,
        403,
        "FORBIDDEN",
        "Treino e avaliação só estão disponíveis em modo demo/paper.",
        request.requestId,
      );
    }

    const body = request.body as { policyVersion?: unknown; params?: unknown } | undefined ?? {};
    const policyVersion = typeof body.policyVersion === "number" ? body.policyVersion : undefined;
    const paramsJson = body.params !== undefined ? JSON.stringify(body.params) : undefined;

    const job = await opts.trainingJobService.createAndRun({ userId, policyVersion, paramsJson });
    return reply.status(201).send({ job });
  });
};

export default fp(trainingJobsRoutes, { name: "training-jobs-routes" });
