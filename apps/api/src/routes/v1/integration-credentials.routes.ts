import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { z } from "zod";
import type { IntegrationCredentialsService } from "../../services/integration-credentials/integration-credentials.service.js";
import { sendError } from "../../shared/errors.js";

const saveBodySchema = z.object({
  sourceKey: z.string().min(1).max(128),
  credentials: z.record(z.string()),
});

export type IntegrationCredentialsRoutesOptions = {
  integrationCredentials: IntegrationCredentialsService;
};

const integrationCredentialsRoutes: FastifyPluginAsync<IntegrationCredentialsRoutesOptions> = async (app, opts) => {
  app.get("/api/v1/integration-credentials", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) {
      return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);
    }
    const data = await opts.integrationCredentials.listForClient();
    return reply.send(data);
  });

  app.post("/api/v1/integration-credentials", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) {
      return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);
    }
    const parsed = saveBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return sendError(reply, 400, "VALIDATION_ERROR", "Corpo inválido.", request.requestId);
    }
    try {
      await opts.integrationCredentials.save(parsed.data.sourceKey, parsed.data.credentials);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao guardar credenciais.";
      return sendError(reply, 500, "CREDENTIALS_ERROR", msg, request.requestId);
    }
    return reply.send({ ok: true });
  });
};

export default fp(integrationCredentialsRoutes, { name: "integration-credentials-routes" });
