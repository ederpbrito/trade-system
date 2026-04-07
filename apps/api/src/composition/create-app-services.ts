import type { Env } from "../config/env.js";
import { DrizzleConnectorHealthRepository } from "../repositories/drizzle-connector-health.repository.js";
import { DrizzleInstrumentRepository } from "../repositories/drizzle-instrument.repository.js";
import { DrizzleIntegrationCredentialsRepository } from "../repositories/drizzle-integration-credentials.repository.js";
import { DrizzleOhlcRepository } from "../repositories/drizzle-ohlc.repository.js";
import { DrizzleWatchlistRepository } from "../repositories/drizzle-watchlist.repository.js";
import { DrizzleRiskLimitsRepository } from "../repositories/drizzle-risk-limits.repository.js";
import { DrizzleRiskExceptionRepository } from "../repositories/drizzle-risk-exception.repository.js";
import { DataSourcesService } from "../services/data-sources/data-sources.service.js";
import { IntegrationCredentialsService } from "../services/integration-credentials/integration-credentials.service.js";
import { MarketDataIngestionService } from "../services/market-data/market-data-ingestion.service.js";
import { OpportunitiesCandidatesService } from "../services/opportunities/opportunities-candidates.service.js";
import { OpportunitiesPreviewService } from "../services/opportunities/opportunities-preview.service.js";
import { BcryptPasswordVerifier, IdentityService } from "../services/identity/index.js";
import { DrizzleUserRepository } from "../repositories/drizzle-user.repository.js";
import { WatchlistService } from "../services/watchlist/watchlist.service.js";
import { RiskService } from "../services/risk/risk.service.js";

export type AppServices = {
  identityService: IdentityService;
  marketDataIngestion: MarketDataIngestionService;
  dataSources: DataSourcesService;
  opportunitiesPreview: OpportunitiesPreviewService;
  opportunitiesCandidates: OpportunitiesCandidatesService;
  watchlist: WatchlistService;
  integrationCredentials: IntegrationCredentialsService;
  riskService: RiskService;
};

export function createAppServices(env: Env): AppServices {
  const healthRepo = new DrizzleConnectorHealthRepository();
  const instrumentRepo = new DrizzleInstrumentRepository();
  const ohlcRepo = new DrizzleOhlcRepository();
  const integrationRepo = new DrizzleIntegrationCredentialsRepository();
  const watchlistRepo = new DrizzleWatchlistRepository();
  const watchlist = new WatchlistService(watchlistRepo, instrumentRepo, ohlcRepo);

  const riskLimitsRepo = new DrizzleRiskLimitsRepository();
  const riskExceptionRepo = new DrizzleRiskExceptionRepository();

  return {
    identityService: new IdentityService(new DrizzleUserRepository(), new BcryptPasswordVerifier()),
    marketDataIngestion: new MarketDataIngestionService(instrumentRepo, ohlcRepo, healthRepo),
    dataSources: new DataSourcesService(healthRepo),
    opportunitiesPreview: new OpportunitiesPreviewService(
      healthRepo,
      instrumentRepo,
      ohlcRepo,
      env.MARKET_DATA_MAX_STALENESS_MS,
      env.OPPORTUNITY_DEGRADATION_POLICY,
    ),
    opportunitiesCandidates: new OpportunitiesCandidatesService(
      watchlistRepo,
      healthRepo,
      ohlcRepo,
      env.MARKET_DATA_MAX_STALENESS_MS,
      env.OPPORTUNITY_DEGRADATION_POLICY,
    ),
    watchlist,
    integrationCredentials: new IntegrationCredentialsService(integrationRepo, env),
    riskService: new RiskService(riskLimitsRepo, riskExceptionRepo),
  };
}
