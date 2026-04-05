import Fastify, { type FastifyRequest, type FastifyServerOptions } from "fastify";
import type { Env } from "./config/env.js";
import { createAppServices, type AppServices } from "./composition/create-app-services.js";
import { registerHttpStack } from "./composition/http-stack.js";
import type { IdentityService } from "./services/identity/index.js";

export type BuildAppOptions = {
  /** Para testes: injetar serviço de identidade mock. */
  identityService?: IdentityService;
  /** Para testes: substituir serviços de domínio (merge parcial). */
  appServices?: Partial<AppServices>;
};

function mergeServices(env: Env, buildOpts?: BuildAppOptions): AppServices {
  const defaults = createAppServices(env);
  const o = buildOpts?.appServices;
  return {
    identityService: buildOpts?.identityService ?? o?.identityService ?? defaults.identityService,
    marketDataIngestion: o?.marketDataIngestion ?? defaults.marketDataIngestion,
    dataSources: o?.dataSources ?? defaults.dataSources,
    opportunitiesPreview: o?.opportunitiesPreview ?? defaults.opportunitiesPreview,
    integrationCredentials: o?.integrationCredentials ?? defaults.integrationCredentials,
  };
}

export async function buildApp(env: Env, serverOpts?: FastifyServerOptions, buildOpts?: BuildAppOptions) {
  const app = Fastify({
    logger: false,
    disableRequestLogging: true,
    ...serverOpts,
  });
  const services = mergeServices(env, buildOpts);
  await registerHttpStack(app, env, services);
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
  const services = createAppServices(env);
  await registerHttpStack(app, env, services);
  return app;
}
