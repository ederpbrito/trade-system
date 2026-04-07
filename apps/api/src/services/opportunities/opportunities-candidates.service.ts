import type { IConnectorHealthRepository, IOhlcBarRepository } from "../market-data/ports.js";
import type { IWatchlistRepository, WatchlistPriority } from "../watchlist/ports.js";
import type { DegradationPolicy } from "./degradation.js";
import { evaluateCandidates, worstConnectorState } from "./degradation.js";
import type { OpportunityCandidate } from "./degradation.js";

function priorityRank(p: WatchlistPriority): number {
  switch (p) {
    case "high":
      return 0;
    case "medium":
      return 1;
    case "low":
      return 2;
    default:
      return 99;
  }
}

/**
 * Motor de candidatos por ativos da watchlist (FR5, FR6 base, FR8 via metadados expostos à UI).
 */
export class OpportunitiesCandidatesService {
  constructor(
    private readonly watchlist: IWatchlistRepository,
    private readonly healthRepo: IConnectorHealthRepository,
    private readonly ohlc: IOhlcBarRepository,
    private readonly maxStalenessMs: number,
    private readonly policy: DegradationPolicy,
  ) {}

  async listForUser(userId: string, log?: (meta: Record<string, unknown>) => void): Promise<{
    candidates: OpportunityCandidate[];
    suppressionReason: string | null;
    policy: DegradationPolicy;
  }> {
    const entries = await this.watchlist.listByUserId(userId);
    const health = await this.healthRepo.listAll();
    const worst = worstConnectorState(health);

    const instrumentIds = entries.map((e) => e.instrumentId);
    const now = Date.now();
    const latestById = await this.ohlc.latestTsOpenForInstrumentIds(instrumentIds);
    let hasStaleBars = false;
    for (const id of instrumentIds) {
      const latest = latestById.get(id) ?? null;
      if (!latest) {
        hasStaleBars = true;
        break;
      }
      if (now - latest.getTime() > this.maxStalenessMs) {
        hasStaleBars = true;
        break;
      }
    }

    const baseCandidates: OpportunityCandidate[] = [];
    for (const e of entries) {
      const pr = priorityRank(e.priority);
      const baseMs = e.updatedAt?.getTime() ?? Date.now();
      baseCandidates.push({
        id: `cand-${e.id}-m15-dia`,
        symbolInternal: e.symbolInternal,
        certainty: "normal",
        instrumentId: e.instrumentId,
        timeframe: "M15",
        horizonte: "dia",
        priorityRank: pr,
        sortTimeMs: baseMs + 1,
      });
      baseCandidates.push({
        id: `cand-${e.id}-h1-semana`,
        symbolInternal: e.symbolInternal,
        certainty: "normal",
        instrumentId: e.instrumentId,
        timeframe: "H1",
        horizonte: "semana",
        priorityRank: pr,
        sortTimeMs: baseMs + 2,
      });
    }

    if (entries.length === 0) {
      hasStaleBars = false;
    }

    const { candidates, suppressionReason } = evaluateCandidates({
      policy: this.policy,
      worstState: worst,
      hasStaleBars: entries.length > 0 ? hasStaleBars : false,
      baseCandidates,
      log,
    });

    return { candidates, suppressionReason, policy: this.policy };
  }
}
