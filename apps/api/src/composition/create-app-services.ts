import type { Env } from "../config/env.js";
import { DrizzleConnectorHealthRepository } from "../repositories/drizzle-connector-health.repository.js";
import { DrizzleInstrumentRepository } from "../repositories/drizzle-instrument.repository.js";
import { DrizzleIntegrationCredentialsRepository } from "../repositories/drizzle-integration-credentials.repository.js";
import { DrizzleOhlcRepository } from "../repositories/drizzle-ohlc.repository.js";
import { DataSourcesService } from "../services/data-sources/data-sources.service.js";
import { IntegrationCredentialsService } from "../services/integration-credentials/integration-credentials.service.js";
import { MarketDataIngestionService } from "../services/market-data/market-data-ingestion.service.js";
import { OpportunitiesPreviewService } from "../services/opportunities/opportunities-preview.service.js";
import { BcryptPasswordVerifier, IdentityService } from "../services/identity/index.js";
import { DrizzleUserRepository } from "../repositories/drizzle-user.repository.js";

export type AppServices = {
  identityService: IdentityService;
  marketDataIngestion: MarketDataIngestionService;
  dataSources: DataSourcesService;
  opportunitiesPreview: OpportunitiesPreviewService;
  integrationCredentials: IntegrationCredentialsService;
};

export function createAppServices(env: Env): AppServices {
  const healthRepo = new DrizzleConnectorHealthRepository();
  const instrumentRepo = new DrizzleInstrumentRepository();
  const ohlcRepo = new DrizzleOhlcRepository();
  const integrationRepo = new DrizzleIntegrationCredentialsRepository();

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
    integrationCredentials: new IntegrationCredentialsService(integrationRepo, env),
  };
}
