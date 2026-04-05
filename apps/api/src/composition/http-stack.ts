import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import secureSession from "@fastify/secure-session";
import requestIdPlugin from "../plugins/requestId.js";
import errorHandlerPlugin from "../plugins/errorHandler.js";
import csrfPlugin from "../plugins/csrf.js";
import type { Env } from "../config/env.js";
import healthRoutes from "../routes/v1/health.js";
import identityRoutes from "../routes/v1/identity.routes.js";
import type { IdentityService } from "../services/identity/index.js";

export type HttpStackOptions = {
  identityService: IdentityService;
};

/**
 * Regista infraestrutura HTTP transversal e rotas versionadas.
 * Mantém `app.ts` como ponto fino de entrada.
 */
export async function registerHttpStack(app: FastifyInstance, env: Env, deps: HttpStackOptions) {
  await app.register(requestIdPlugin);
  await app.register(errorHandlerPlugin);

  await app.register(cors, {
    origin: env.WEB_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token", "X-Request-Id"],
  });

  await app.register(formbody);

  await app.register(secureSession, {
    secret: env.SESSION_SECRET,
    salt: env.SESSION_SALT,
    expiry: Math.floor(env.SESSION_MAX_AGE_MS / 1000),
    cookie: {
      path: "/",
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Math.floor(env.SESSION_MAX_AGE_MS / 1000),
    },
  });

  await app.register(csrfPlugin);

  await app.register(healthRoutes);
  await app.register(identityRoutes, { identityService: deps.identityService });
}
