import type { IExperimentRepository, ExperimentRun } from "./ports.js";

export type { ExperimentRun };

/**
 * FR23 — persistência de métricas e artefactos de experimentos.
 * FR24 — suporte à comparação de versões na UI.
 */
export class ExperimentsService {
  constructor(private readonly repo: IExperimentRepository) {}

  async getById(id: string): Promise<ExperimentRun | null> {
    return this.repo.findById(id);
  }

  async listForUser(userId: string): Promise<ExperimentRun[]> {
    return this.repo.listByUserId(userId);
  }
}
