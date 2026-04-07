export type ExperimentMetrics = {
  profitFactorProxy: number;
  simulatedDrawdown: number;
  winRate: number;
  totalTrades: number;
};

export type ExperimentRun = {
  id: string;
  userId: string;
  trainingJobId: string | null;
  policyVersion: number;
  datasetHash: string;
  metrics: ExperimentMetrics;
  artifactPath: string | null;
  label: string | null;
  createdAt: Date;
};

export type CreateExperimentInput = {
  userId: string;
  trainingJobId?: string;
  policyVersion: number;
  datasetHash: string;
  metricsJson: string;
  artifactPath?: string;
  label?: string;
};

export interface IExperimentRepository {
  create(input: CreateExperimentInput): Promise<ExperimentRun>;
  findById(id: string): Promise<ExperimentRun | null>;
  listByUserId(userId: string): Promise<ExperimentRun[]>;
}
