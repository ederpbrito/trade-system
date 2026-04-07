import type { IRankingPolicyRepository, PolicyWeights, RankingPolicy } from "./ports.js";

export type { RankingPolicy, PolicyWeights };

/**
 * FR21 — gestão de políticas versionadas que influenciam o ranking de candidatos.
 */
export class RankingPolicyService {
  constructor(private readonly repo: IRankingPolicyRepository) {}

  async getActive(): Promise<RankingPolicy | null> {
    return this.repo.findActive();
  }

  async listAll(): Promise<RankingPolicy[]> {
    return this.repo.listAll();
  }

  async create(name: string, weights: PolicyWeights): Promise<RankingPolicy> {
    return this.repo.create({ name, weights });
  }
}
