/**
 * Rotas do assistente de decisão contextual.
 * FR9–FR11: tese da oportunidade, conflito entre janelas, relação com risco.
 *
 * GET /api/v1/assistant/thesis?instrumentId=&symbolInternal=&timeframe=&horizonte=
 */
import type { FastifyInstance } from "fastify";
import type { AssistantService } from "../../services/assistant/assistant.service.js";
import type { RiskService } from "../../services/risk/risk.service.js";
import type { AssistantThesisRequest, AssistantRiskContext } from "../../services/assistant/ports.js";

type AssistantRoutesOptions = {
  assistantService: AssistantService;
  riskService: RiskService;
};

export default async function assistantRoutes(app: FastifyInstance, opts: AssistantRoutesOptions) {
  const { assistantService, riskService } = opts;

  /**
   * FR9–FR11 — GET tese do assistente para candidato e janela seleccionados.
   * Query params: instrumentId, symbolInternal, timeframe, horizonte
   * Devolve: AssistantThesisResponse (secções, conflito, relação com risco)
   */
  app.get("/api/v1/assistant/thesis", async (req, reply) => {
    const userId = req.session.get("userId") as string | undefined;
    if (!userId) {
      return reply.status(401).send({
        error: { code: "UNAUTHORIZED", message: "Não autenticado.", requestId: req.id },
      });
    }

    const query = req.query as Record<string, string>;
    const { instrumentId, symbolInternal, timeframe, horizonte } = query;

    if (!instrumentId || !symbolInternal || !timeframe || !horizonte) {
      return reply.status(422).send({
        error: {
          code: "ASSISTANT_MISSING_PARAMS",
          message: "Parâmetros obrigatórios: instrumentId, symbolInternal, timeframe, horizonte.",
          requestId: req.id,
        },
      });
    }

    const thesisReq: AssistantThesisRequest = { instrumentId, symbolInternal, timeframe, horizonte };

    // FR11: dados de risco vindos da API — não inventados pelo cliente
    const limits = await riskService.getLimits(userId);
    const riskCtx: AssistantRiskContext | null = limits
      ? {
          maxPositionSize: limits.maxPositionSize,
          maxDailyLoss: limits.maxDailyLoss,
        }
      : null;

    const thesis = assistantService.generateThesis(thesisReq, riskCtx);
    return reply.send({ thesis });
  });
}
