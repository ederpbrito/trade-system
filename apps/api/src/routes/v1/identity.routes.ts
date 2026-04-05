import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { randomBytes } from "node:crypto";
import { loginBodySchema } from "@tradesystem/shared";
import type { IdentityService } from "../../services/identity/index.js";
import { sendError } from "../../shared/errors.js";

export type IdentityRoutesOptions = {
  identityService: IdentityService;
};

function ensureCsrfToken(session: FastifyRequest["session"]) {
  let token = session.get("csrfToken");
  if (!token) {
    token = randomBytes(32).toString("hex");
    session.set("csrfToken", token);
  }
  return token;
}

const identityRoutes: FastifyPluginAsync<IdentityRoutesOptions> = async (app, opts) => {
  const identity = opts.identityService;

  app.post("/api/v1/auth/login", async (request, reply) => {
    const body = loginBodySchema.parse(request.body);
    const user = await identity.verifyCredentials(body.email, body.password);
    if (!user) {
      return sendError(reply, 401, "INVALID_CREDENTIALS", "Email ou palavra-passe inválidos.", request.requestId);
    }

    const csrfToken = randomBytes(32).toString("hex");
    request.session.set("userId", user.id);
    request.session.set("csrfToken", csrfToken);

    return reply.send({
      user: { id: user.id, email: user.email },
      csrfToken,
    });
  });

  app.post("/api/v1/auth/logout", async (request, reply) => {
    request.session.delete();
    return reply.send({ ok: true });
  });

  app.get("/api/v1/auth/me", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) {
      return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);
    }
    const u = await identity.getPublicUserById(userId);
    if (!u) {
      request.session.delete();
      return sendError(reply, 401, "UNAUTHORIZED", "Utilizador inválido.", request.requestId);
    }
    return { user: { id: u.id, email: u.email } };
  });

  app.get("/api/v1/auth/csrf", async (request) => {
    const csrfToken = ensureCsrfToken(request.session);
    return { csrfToken };
  });
};

export default fp(identityRoutes, { name: "identity-routes" });
