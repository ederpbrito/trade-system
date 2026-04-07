import type { FastifyInstance } from "fastify";
import type { RiskService } from "../../services/risk/risk.service.js";
import type { RiskLimitsInput, AdherenceProposal } from "../../services/risk/ports.js";
import { VALID_LIMIT_KEYS } from "../../services/risk/ports.js";

type RiskRoutesOptions = {
  riskService: RiskService;
};

export default async function riskRoutes(app: FastifyInstance, opts: RiskRoutesOptions) {
  const { riskService } = opts;

  /** FR13/FR35 — GET limites do utilizador autenticado */
  app.get("/api/v1/risk/limits", async (req, reply) => {
    const userId = req.session.get("userId") as string | undefined;
    if (!userId) return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Não autenticado.", requestId: req.id } });

    const limits = await riskService.getLimits(userId);
    return reply.send({ limits: limits ?? null });
  });

  /** FR13/FR35 — PUT limites (upsert) com validação */
  app.put("/api/v1/risk/limits", async (req, reply) => {
    const userId = req.session.get("userId") as string | undefined;
    if (!userId) return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Não autenticado.", requestId: req.id } });

    const body = req.body as RiskLimitsInput;
    try {
      const limits = await riskService.setLimits(userId, body);
      return reply.send({ limits });
    } catch (err: unknown) {
      const e = err as { code?: string; errors?: string[]; message?: string };
      if (e.code === "RISK_LIMITS_INVALID") {
        return reply.status(422).send({
          error: { code: "RISK_LIMITS_INVALID", message: e.message ?? "Dados inválidos.", errors: e.errors ?? [], requestId: req.id },
        });
      }
      throw err;
    }
  });

  /**
   * FR14/FR16 — POST verificar aderência de proposta aos limites.
   * Body: AdherenceProposal (positionSize, price, currentDailyLoss, concentration, totalExposure)
   */
  app.post("/api/v1/risk/check", async (req, reply) => {
    const userId = req.session.get("userId") as string | undefined;
    if (!userId) return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Não autenticado.", requestId: req.id } });

    const proposal = req.body as AdherenceProposal;
    const limits = await riskService.getLimits(userId);
    const result = riskService.checkAdherence(limits, proposal);
    return reply.send({ result });
  });

  /**
   * FR15/FR29 — POST registar exceção aprovada pelo utilizador.
   * Body: { limitKey, proposedValue, limitValue, reason, contextJson? }
   */
  app.post("/api/v1/risk/exception", async (req, reply) => {
    const userId = req.session.get("userId") as string | undefined;
    if (!userId) return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Não autenticado.", requestId: req.id } });

    const body = req.body as {
      limitKey: string;
      proposedValue: number;
      limitValue: number;
      reason: string;
      contextJson?: string;
    };

    if (!VALID_LIMIT_KEYS.includes(body.limitKey as Parameters<RiskService["recordException"]>[0]["limitKey"])) {
      return reply.status(422).send({
        error: { code: "RISK_INVALID_LIMIT_KEY", message: `limitKey inválido: ${body.limitKey}`, requestId: req.id },
      });
    }

    try {
      const record = await riskService.recordException({
        userId,
        limitKey: body.limitKey as Parameters<RiskService["recordException"]>[0]["limitKey"],
        proposedValue: body.proposedValue,
        limitValue: body.limitValue,
        reason: body.reason,
        contextJson: body.contextJson,
      });
      return reply.status(201).send({ exception: record });
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "RISK_EXCEPTION_REASON_REQUIRED") {
        return reply.status(422).send({
          error: { code: "RISK_EXCEPTION_REASON_REQUIRED", message: e.message ?? "Motivo obrigatório.", requestId: req.id },
        });
      }
      throw err;
    }
  });

  /** FR15/FR29 — GET trilha de exceções do utilizador */
  app.get("/api/v1/risk/exceptions", async (req, reply) => {
    const userId = req.session.get("userId") as string | undefined;
    if (!userId) return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Não autenticado.", requestId: req.id } });

    const exceptions = await riskService.getExceptionLog(userId);
    return reply.send({ exceptions });
  });
}
