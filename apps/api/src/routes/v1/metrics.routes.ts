/**
 * Rotas de métricas — FR31.
 * GET /api/v1/metrics/summary — agregados de decisões e execuções demo.
 */
import type { FastifyInstance } from "fastify";
import type { MetricsService } from "../../services/decisions/metrics.service.js";

type MetricsRoutesOptions = {
  metricsService: MetricsService;
};

export default async function metricsRoutes(app: FastifyInstance, opts: MetricsRoutesOptions) {
  const { metricsService } = opts;

  /** FR31 — GET agregados de desempenho MVP */
  app.get("/api/v1/metrics/summary", async (req, reply) => {
    const userId = req.session.get("userId") as string | undefined;
    if (!userId) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Não autenticado.", requestId: req.id } });
    }

    const summary = await metricsService.getSummary(userId);
    return reply.send({ summary });
  });
}
