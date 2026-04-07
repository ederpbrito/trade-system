import type { ITrainingJobRepository, TrainingJob, CreateTrainingJobInput } from "./ports.js";
import type { IExperimentRepository } from "../experiments/ports.js";
import type { IRankingPolicyRepository } from "../ranking-policy/ports.js";

export type { TrainingJob };

/**
 * FR22 — ciclo de treino e avaliação isolado em ambiente paper/demo.
 * O job é criado como "queued" e executado de forma síncrona simplificada
 * (sem worker externo no MVP — execução inline ao pedido).
 */
export class TrainingJobService {
  constructor(
    private readonly jobRepo: ITrainingJobRepository,
    private readonly experimentRepo: IExperimentRepository,
    private readonly policyRepo: IRankingPolicyRepository,
  ) {}

  async createAndRun(input: CreateTrainingJobInput): Promise<TrainingJob> {
    const policyVersion = input.policyVersion ?? (await this.policyRepo.findActive())?.version ?? 1;
    const job = await this.jobRepo.create({ ...input, policyVersion });

    // Marcar como running
    await this.jobRepo.updateStatus(job.id, "running", { startedAt: new Date() });

    try {
      // Simulação de treino em paper/demo: gerar métricas sintéticas
      const metrics = simulatePaperTraining(policyVersion);
      const artifactPath = `artifacts/paper-demo/${job.id}.json`;

      // Persistir experimento (FR23)
      await this.experimentRepo.create({
        userId: input.userId,
        trainingJobId: job.id,
        policyVersion,
        datasetHash: metrics.datasetHash,
        metricsJson: JSON.stringify(metrics.metrics),
        artifactPath,
        label: `auto-run-policy-v${policyVersion}`,
      });

      const finished = await this.jobRepo.updateStatus(job.id, "success", { finishedAt: new Date() });
      return finished;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return this.jobRepo.updateStatus(job.id, "failed", { errorMessage, finishedAt: new Date() });
    }
  }

  async getStatus(id: string): Promise<TrainingJob | null> {
    return this.jobRepo.findById(id);
  }

  async listForUser(userId: string): Promise<TrainingJob[]> {
    return this.jobRepo.listByUserId(userId);
  }
}

/**
 * Simulação determinística de treino em paper/demo.
 * Gera métricas baseadas na versão da política para demonstração.
 */
function simulatePaperTraining(policyVersion: number): {
  datasetHash: string;
  metrics: { profitFactorProxy: number; simulatedDrawdown: number; winRate: number; totalTrades: number };
} {
  const seed = policyVersion * 7;
  return {
    datasetHash: `demo-dataset-v${policyVersion}-${seed.toString(16).padStart(8, "0")}`,
    metrics: {
      profitFactorProxy: 1.2 + (seed % 10) * 0.05,
      simulatedDrawdown: 0.08 + (seed % 5) * 0.01,
      winRate: 0.52 + (seed % 8) * 0.01,
      totalTrades: 100 + seed * 3,
    },
  };
}
