import Fastify, { type FastifyRequest, type FastifyServerOptions } from "fastify";
import type { Env } from "./config/env.js";
import { registerHttpStack } from "./composition/http-stack.js";
import { createIdentityService } from "./composition/service-factory.js";
import type { IdentityService } from "./services/identity/index.js";

export type BuildAppOptions = {
  /** Para testes: injetar serviço mock sem base de dados real. */
  identityService?: IdentityService;
};

export async function buildApp(env: Env, serverOpts?: FastifyServerOptions, buildOpts?: BuildAppOptions) {
  const app = Fastify({
    logger: false,
    disableRequestLogging: true,
    ...serverOpts,
  });
  const identityService = buildOpts?.identityService ?? createIdentityService();
  await registerHttpStack(app, env, { identityService });
  return app;
}

export async function buildAppForServer(env: Env) {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      serializers: {
        req(request: FastifyRequest) {
          return {
            method: request.method,
            url: request.url,
            requestId: request.requestId,
          };
        },
      },
    },
  });
  await registerHttpStack(app, env, { identityService: createIdentityService() });
  return app;
}
