export type PolicyWeights = {
  /** Peso do rank de prioridade da watchlist (0–1) */
  priorityWeight: number;
  /** Peso da recência temporal (0–1) */
  timeWeight: number;
  /** Bónus aplicado a candidatos com horizonte "semana" ou "mês" (0–1) */
  horizonBonus: number;
};

export type RankingPolicy = {
  id: string;
  version: number;
  name: string;
  weights: PolicyWeights;
  isActive: boolean;
  createdAt: Date;
};

export interface IRankingPolicyRepository {
  /** Devolve a política activa, ou null se não existir nenhuma */
  findActive(): Promise<RankingPolicy | null>;
  /** Lista todas as políticas ordenadas por versão descendente */
  listAll(): Promise<RankingPolicy[]>;
  /** Cria nova política e activa-a (desactiva as anteriores) */
  create(data: { name: string; weights: PolicyWeights }): Promise<RankingPolicy>;
}
