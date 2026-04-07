import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import secureSession from "@fastify/secure-session";
import requestIdPlugin from "../plugins/requestId.js";
import errorHandlerPlugin from "../plugins/errorHandler.js";
import csrfPlugin from "../plugins/csrf.js";
import type { Env } from "../config/env.js";
import dataSourcesRoutes from "../routes/v1/data-sources.routes.js";
import healthRoutes from "../routes/v1/health.js";
import identityRoutes from "../routes/v1/identity.routes.js";
import instrumentsRoutes from "../routes/v1/instruments.routes.js";
import integrationCredentialsRoutes from "../routes/v1/integration-credentials.routes.js";
import marketDataRoutes from "../routes/v1/market-data.routes.js";
import marketStreamPlugin from "../routes/v1/market-stream.js";
import opportunitiesRoutes from "../routes/v1/opportunities.routes.js";
import watchlistRoutes from "../routes/v1/watchlist.routes.js";
import executionRoutes from "../routes/v1/execution.routes.js";
import decisionsRoutes from "../routes/v1/decisions.routes.js";
import auditRoutes from "../routes/v1/audit.routes.js";
import metricsRoutes from "../routes/v1/metrics.routes.js";
import type { DataSourcesService } from "../services/data-sources/data-sources.service.js";
import type { IntegrationCredentialsService } from "../services/integration-credentials/integration-credentials.service.js";
import type { MarketDataIngestionService } from "../services/market-data/market-data-ingestion.service.js";
import type { OpportunitiesCandidatesService } from "../services/opportunities/opportunities-candidates.service.js";
import type { OpportunitiesPreviewService } from "../services/opportunities/opportunities-preview.service.js";
import type { IdentityService } from "../services/identity/index.js";
import type { WatchlistService } from "../services/watchlist/watchlist.service.js";
import type { RiskService } from "../services/risk/risk.service.js";
import type { AssistantService } from "../services/assistant/assistant.service.js";
import type { TradingModeService } from "../services/trading-mode/trading-mode.service.js";
import type { DecisionsService } from "../services/decisions/decisions.service.js";
import type { MetricsService } from "../services/decisions/metrics.service.js";
import type { IAuditRepository } from "../services/decisions/ports.js";
import riskRoutes from "../routes/v1/risk.routes.js";
import assistantRoutes from "../routes/v1/assistant.routes.js";

export type HttpStackOptions = {
  identityService: IdentityService;
  marketDataIngestion: MarketDataIngestionService;
  dataSources: DataSourcesService;
  opportunitiesPreview: OpportunitiesPreviewService;
  opportunitiesCandidates: OpportunitiesCandidatesService;
  watchlist: WatchlistService;
  integrationCredentials: IntegrationCredentialsService;
  riskService: RiskService;
  assistantService: AssistantService;
  tradingModeService: TradingModeService;
  decisionsService: DecisionsService;
  metricsService: MetricsService;
  auditRepo: IAuditRepository;
};

/**
 * Regista infraestrutura HTTP transversal e rotas versionadas.
 * Mantém `app.ts` como ponto fino de entrada.
 */
export async function registerHttpStack(app: FastifyInstance, env: Env, deps: HttpStackOptions) {
  await app.register(requestIdPlugin);
  await app.register(errorHandlerPlugin);

  await app.register(cors, {
    // Só ecoar ACAO quando o Origin do pedido coincide (string fixa aplica-se a todos os pedidos e não bloqueia origens falsas).
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, false);
        return;
      }
      if (origin === env.WEB_ORIGIN) {
        cb(null, origin);
        return;
      }
      cb(null, false);
    },
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
  await app.register(marketDataRoutes, { marketDataIngestion: deps.marketDataIngestion });
  await app.register(dataSourcesRoutes, { dataSources: deps.dataSources });
  await app.register(opportunitiesRoutes, {
    opportunitiesPreview: deps.opportunitiesPreview,
    opportunitiesCandidates: deps.opportunitiesCandidates,
  });
  await app.register(watchlistRoutes, { watchlist: deps.watchlist });
  await app.register(instrumentsRoutes, { watchlist: deps.watchlist });
  await app.register(integrationCredentialsRoutes, {
    integrationCredentials: deps.integrationCredentials,
  });
  await app.register(riskRoutes, { riskService: deps.riskService });
  await app.register(assistantRoutes, { assistantService: deps.assistantService, riskService: deps.riskService });
  await app.register(executionRoutes, {
    tradingModeService: deps.tradingModeService,
    auditRepo: deps.auditRepo,
  });
  await app.register(decisionsRoutes, {
    decisionsService: deps.decisionsService,
    tradingModeService: deps.tradingModeService,
  });
  await app.register(auditRoutes, { auditRepo: deps.auditRepo });
  await app.register(metricsRoutes, { metricsService: deps.metricsService });
  await app.register(marketStreamPlugin);
}
