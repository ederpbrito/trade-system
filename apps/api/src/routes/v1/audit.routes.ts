/**
 * Rotas de auditoria — FR29.
 * GET /api/v1/audit/events — trilha auditável de decisões e execuções.
 */
import type { FastifyInstance } from "fastify";
import type { IAuditRepository } from "../../services/decisions/ports.js";
import { parseLimit, parseDateParam } from "../../shared/query-params.js";

type AuditRoutesOptions = {
  auditRepo: IAuditRepository;
};

export default async function auditRoutes(app: FastifyInstance, opts: AuditRoutesOptions) {
  const { auditRepo } = opts;

  /**
   * FR29 — GET trilha auditável.
   * Query: eventType?, from?, to?, limit?
   * Cada registo inclui: timestamp UTC, utilizador, janela (TF+horizonte), modo demo/prod, ids de correlação.
   */
  app.get("/api/v1/audit/events", async (req, reply) => {
    const userId = req.session.get("userId") as string | undefined;
    if (!userId) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Não autenticado.", requestId: req.id } });
    }

    const query = req.query as {
      eventType?: string;
      from?: string;
      to?: string;
      limit?: string;
    };

    try {
      const events = await auditRepo.findByUserId(userId, {
        eventType: query.eventType,
        from: parseDateParam(query.from, "from"),
        to: parseDateParam(query.to, "to"),
        limit: parseLimit(query.limit),
      });
      return reply.send({ events });
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string; param?: string };
      if (e.code === "INVALID_QUERY_PARAM") {
        return reply.status(422).send({ error: { code: e.code, message: e.message, param: e.param, requestId: req.id } });
      }
      throw err;
    }
  });
}
