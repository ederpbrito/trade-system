import type { Env } from "../config/env.js";
import { DrizzleConnectorHealthRepository } from "../repositories/drizzle-connector-health.repository.js";
import { DrizzleInstrumentRepository } from "../repositories/drizzle-instrument.repository.js";
import { DrizzleIntegrationCredentialsRepository } from "../repositories/drizzle-integration-credentials.repository.js";
import { DrizzleOhlcRepository } from "../repositories/drizzle-ohlc.repository.js";
import { DrizzleWatchlistRepository } from "../repositories/drizzle-watchlist.repository.js";
import { DrizzleRiskLimitsRepository } from "../repositories/drizzle-risk-limits.repository.js";
import { DrizzleRiskExceptionRepository } from "../repositories/drizzle-risk-exception.repository.js";
import { DrizzleOrderIntentRepository } from "../repositories/drizzle-order-intent.repository.js";
import { DrizzleDecisionRepository } from "../repositories/drizzle-decision.repository.js";
import { DrizzleAuditRepository } from "../repositories/drizzle-audit.repository.js";
import { DataSourcesService } from "../services/data-sources/data-sources.service.js";
import { IntegrationCredentialsService } from "../services/integration-credentials/integration-credentials.service.js";
import { MarketDataIngestionService } from "../services/market-data/market-data-ingestion.service.js";
import { OpportunitiesCandidatesService } from "../services/opportunities/opportunities-candidates.service.js";
import { OpportunitiesPreviewService } from "../services/opportunities/opportunities-preview.service.js";
import { BcryptPasswordVerifier, IdentityService } from "../services/identity/index.js";
import { DrizzleUserRepository } from "../repositories/drizzle-user.repository.js";
import { WatchlistService } from "../services/watchlist/watchlist.service.js";
import { RiskService } from "../services/risk/risk.service.js";
import { TradingModeService } from "../services/trading-mode/trading-mode.service.js";
import { DemoExecutionProvider } from "../connectors/demo-execution.provider.js";
import { DecisionsService } from "../services/decisions/decisions.service.js";
import { MetricsService } from "../services/decisions/metrics.service.js";
import type { IAuditRepository } from "../services/decisions/ports.js";
import { AssistantService } from "../services/assistant/assistant.service.js";
import { RankingPolicyService } from "../services/ranking-policy/ranking-policy.service.js";
import { TrainingJobService } from "../services/training/training-job.service.js";
import { ExperimentsService } from "../services/experiments/experiments.service.js";
import { DrizzleRankingPolicyRepository } from "../repositories/drizzle-ranking-policy.repository.js";
import { DrizzleTrainingJobRepository } from "../repositories/drizzle-training-job.repository.js";
import { DrizzleExperimentRepository } from "../repositories/drizzle-experiment.repository.js";

export type AppServices = {
  identityService: IdentityService;
  marketDataIngestion: MarketDataIngestionService;
  dataSources: DataSourcesService;
  opportunitiesPreview: OpportunitiesPreviewService;
  opportunitiesCandidates: OpportunitiesCandidatesService;
  watchlist: WatchlistService;
  integrationCredentials: IntegrationCredentialsService;
  riskService: RiskService;
  tradingModeService: TradingModeService;
  decisionsService: DecisionsService;
  metricsService: MetricsService;
  auditRepo: IAuditRepository;
  assistantService: AssistantService;
  rankingPolicyService: RankingPolicyService;
  trainingJobService: TrainingJobService;
  experimentsService: ExperimentsService;
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

  const orderIntentRepo = new DrizzleOrderIntentRepository();
  const decisionRepo = new DrizzleDecisionRepository();
  const auditRepo = new DrizzleAuditRepository();

  const demoConnector = new DemoExecutionProvider();
  const tradingModeService = new TradingModeService(demoConnector, orderIntentRepo);
  const decisionsService = new DecisionsService(decisionRepo, auditRepo);
  const metricsService = new MetricsService(decisionRepo, orderIntentRepo);

  const rankingPolicyRepo = new DrizzleRankingPolicyRepository();
  const trainingJobRepo = new DrizzleTrainingJobRepository();
  const experimentRepo = new DrizzleExperimentRepository();
  const rankingPolicyService = new RankingPolicyService(rankingPolicyRepo);
  const experimentsService = new ExperimentsService(experimentRepo);
  const trainingJobService = new TrainingJobService(trainingJobRepo, experimentRepo, rankingPolicyRepo);

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
    assistantService: new AssistantService(),
    tradingModeService,
    decisionsService,
    metricsService,
    auditRepo,
    rankingPolicyService,
    trainingJobService,
    experimentsService,
  };
}
