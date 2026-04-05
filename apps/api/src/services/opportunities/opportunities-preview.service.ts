import type { IConnectorHealthRepository, IInstrumentRepository, IOhlcBarRepository } from "../market-data/ports.js";
import type { DegradationPolicy } from "./degradation.js";
import { evaluateCandidates, worstConnectorState } from "./degradation.js";

export type OpportunitiesPreviewResult = {
  candidates: Array<{ id: string; symbolInternal: string; certainty: "normal" | "uncertain" }>;
  suppressionReason: string | null;
  policy: DegradationPolicy;
};

/**
 * Pré-visualização mínima do motor de oportunidades (FR27): aplica política de degradação antes de sinais reais.
 */
export class OpportunitiesPreviewService {
  constructor(
    private readonly healthRepo: IConnectorHealthRepository,
    private readonly instruments: IInstrumentRepository,
    private readonly ohlc: IOhlcBarRepository,
    private readonly maxStalenessMs: number,
    private readonly policy: DegradationPolicy,
  ) {}

  async preview(log?: (meta: Record<string, unknown>) => void): Promise<OpportunitiesPreviewResult> {
    const health = await this.healthRepo.listAll();
    const worst = worstConnectorState(health);

    const inst = await this.instruments.listAllMinimal();
    const now = Date.now();
    const ids = inst.map((i) => i.id);
    const latestById = await this.ohlc.latestTsOpenForInstrumentIds(ids);
    let hasStaleBars = false;
    for (const i of inst) {
      const latest = latestById.get(i.id) ?? null;
      if (!latest) {
        hasStaleBars = true;
        break;
      }
      if (now - latest.getTime() > this.maxStalenessMs) {
        hasStaleBars = true;
        break;
      }
    }

    const baseCandidates = inst.map((i) => ({
      id: `preview-${i.id}`,
      symbolInternal: i.symbolInternal,
      certainty: "normal" as const,
    }));

    const { candidates, suppressionReason } = evaluateCandidates({
      policy: this.policy,
      worstState: worst,
      hasStaleBars: inst.length > 0 ? hasStaleBars : false,
      baseCandidates,
      log,
    });

    return { candidates, suppressionReason, policy: this.policy };
  }
}
