import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { apiFetch } from "../../../shared/http/api-client";
import { useMarketWebSocket } from "../../../shared/realtime/useMarketWebSocket";
import { useAuth } from "../../identity/context/AuthContext";
import type { CockpitCandidate, CandidateSortBy } from "../lib/candidate-utils";
import { filterCandidatesByWindow, sortCandidatesStable } from "../lib/candidate-utils";
import { RiskPanel } from "./RiskPanel";
import { ExecutionPanel } from "./ExecutionPanel";
import { DecisionForm } from "./DecisionForm";
import { DecisionHistoryPanel } from "./DecisionHistoryPanel";
import { MetricsPanel } from "./MetricsPanel";
import { AssistantPanel } from "./AssistantPanel";
import { ApiErrorDisplay } from "../../../shared/ui/ApiErrorDisplay";
import type { ApiError } from "../../../shared/ui/ApiErrorDisplay";

type SourceHealth = {
  connectorId: string;
  state: string;
  lastHeartbeatAt: string | null;
  latencyMs: number | null;
  updatedAt: string;
};

type WatchlistEntry = {
  id: string;
  instrumentId: string;
  symbolInternal: string;
  market: string;
  priority: "low" | "medium" | "high";
  lastClose: number | null;
  lastTsOpen: string | null;
  lastTimeframe: string | null;
  changePercent: number | null;
};

type CatalogInstrument = {
  id: string;
  symbolInternal: string;
  market: string;
};

type CandidatesApiResponse = {
  candidates: CockpitCandidate[];
  suppressionReason: string | null;
  policy: string;
  sortBy: CandidateSortBy;
};

type DecisionContext = {
  candidateId: string;
  instrumentId: string;
  symbolInternal: string;
  timeframe: string;
  horizonte: string;
};

function stateLabel(state: string): string {
  switch (state) {
    case "operational":
      return "Operacional";
    case "degraded":
      return "Degradada";
    case "unavailable":
      return "Indisponível";
    default:
      return state;
  }
}

function stateStyles(state: string): { bg: string; color: string } {
  switch (state) {
    case "operational":
      return { bg: "#dcfce7", color: "#166534" };
    case "degraded":
      return { bg: "#fef9c3", color: "#854d0e" };
    case "unavailable":
      return { bg: "#fee2e2", color: "#991b1b" };
    default:
      return { bg: "#f1f5f9", color: "#334155" };
  }
}

const HEALTH_POLL_MS = 15_000;

type ViewportBand = "narrow" | "mid" | "wide";

function useViewportBand(): ViewportBand {
  const [band, setBand] = useState<ViewportBand>(() => {
    if (typeof window === "undefined") return "mid";
    const w = window.innerWidth;
    if (w < 768) return "narrow";
    if (w >= 1024) return "wide";
    return "mid";
  });

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 768) setBand("narrow");
      else if (w >= 1024) setBand("wide");
      else setBand("mid");
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return band;
}

const card: CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: "1rem",
  background: "#fff",
};

const chip: CSSProperties = {
  display: "inline-block",
  fontSize: "0.75rem",
  fontWeight: 600,
  padding: "0.2rem 0.5rem",
  borderRadius: 6,
  background: "#e0e7ff",
  color: "#3730a3",
  marginRight: 6,
  marginBottom: 4,
};

export function CockpitPage() {
  const { user } = useAuth();
  const vp = useViewportBand();

  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [sourcesError, setSourcesError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [catalog, setCatalog] = useState<CatalogInstrument[]>([]);
  const [candidatesPayload, setCandidatesPayload] = useState<CandidatesApiResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  const [filterMarket, setFilterMarket] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "low" | "medium" | "high">("all");
  const [tfFilter, setTfFilter] = useState<string>("all");
  const [horizonFilter, setHorizonFilter] = useState<string>("all");
  const [candidateSort, setCandidateSort] = useState<CandidateSortBy>("priority");

  const [addInstrumentId, setAddInstrumentId] = useState<string>("");
  const [addPriority, setAddPriority] = useState<"low" | "medium" | "high">("medium");

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [decisionContext, setDecisionContext] = useState<DecisionContext | null>(null);
  const [lastOrderIntentId, setLastOrderIntentId] = useState<string | undefined>(undefined);

  const streamSymbols = useMemo(() => {
    const syms = watchlist.map((w) => w.symbolInternal);
    if (syms.length === 0) return ["EURUSD_TEST", "XAUUSD_TEST"] as const;
    return syms;
  }, [watchlist]);

  const liveTicks = useMarketWebSocket(Boolean(user), streamSymbols);

  const tickBySymbol = useMemo(() => {
    const m = new Map<string, (typeof liveTicks)[0]>();
    for (const t of liveTicks) m.set(t.symbolInternal, t);
    return m;
  }, [liveTicks]);

  const loadHealth = useCallback(async () => {
    const res = await apiFetch("/api/v1/data-sources/health");
    if (!res.ok) {
      setSourcesError("Não foi possível carregar o estado das fontes.");
      return;
    }
    setSourcesError(null);
    const data = (await res.json()) as { sources: SourceHealth[] };
    setSources(data.sources);
  }, []);

  const loadWatchlist = useCallback(async () => {
    const res = await apiFetch("/api/v1/watchlist");
    if (!res.ok) return;
    const data = (await res.json()) as { entries: WatchlistEntry[] };
    setWatchlist(data.entries);
  }, []);

  const loadCatalog = useCallback(async () => {
    const res = await apiFetch("/api/v1/instruments");
    if (!res.ok) return;
    const data = (await res.json()) as { instruments: CatalogInstrument[] };
    setCatalog(data.instruments);
  }, []);

  const loadCandidates = useCallback(async () => {
    const res = await apiFetch(`/api/v1/opportunities/candidates?sort=${candidateSort}`);
    if (!res.ok) return;
    setCandidatesPayload((await res.json()) as CandidatesApiResponse);
  }, [candidateSort]);

  useEffect(() => {
    if (!user) return;
    void loadHealth();
    const id = setInterval(() => void loadHealth(), HEALTH_POLL_MS);
    return () => clearInterval(id);
  }, [user, loadHealth]);

  useEffect(() => {
    if (!user) return;
    void loadWatchlist();
    void loadCatalog();
  }, [user, loadWatchlist, loadCatalog]);

  useEffect(() => {
    if (!user) return;
    void loadCandidates();
    const id = setInterval(() => void loadCandidates(), HEALTH_POLL_MS);
    return () => clearInterval(id);
  }, [user, loadCandidates]);

  const markets = useMemo(() => {
    const s = new Set<string>();
    for (const w of watchlist) s.add(w.market);
    return ["all", ...[...s].sort()];
  }, [watchlist]);

  const filteredWatchlist = useMemo(() => {
    const t0 = typeof performance !== "undefined" ? performance.now() : 0;
    let rows = watchlist;
    if (filterMarket !== "all") rows = rows.filter((r) => r.market === filterMarket);
    if (filterPriority !== "all") rows = rows.filter((r) => r.priority === filterPriority);
    if (typeof performance !== "undefined") {
      const dt = performance.now() - t0;
      if (dt > 200) console.warn("cockpit: filtro watchlist excedeu 200ms", dt);
    }
    return rows;
  }, [watchlist, filterMarket, filterPriority]);

  const filteredCandidates = useMemo(() => {
    if (!candidatesPayload) return [];
    const f = filterCandidatesByWindow(candidatesPayload.candidates, tfFilter, horizonFilter);
    return sortCandidatesStable(f, candidateSort);
  }, [candidatesPayload, tfFilter, horizonFilter, candidateSort]);

  const selectedCandidate = useMemo(
    () => filteredCandidates.find((c) => c.id === selectedCandidateId) ?? null,
    [filteredCandidates, selectedCandidateId],
  );

  const onAddWatchlist = async () => {
    if (!addInstrumentId) return;
    setLoadError(null);
    setApiError(null);
    try {
      const res = await apiFetch("/api/v1/watchlist", {
        method: "POST",
        body: JSON.stringify({ instrumentId: addInstrumentId, priority: addPriority }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string; requestId?: string } } | null;
        setApiError(j?.error ?? { message: "Falha ao adicionar." });
        setLoadError(j?.error?.message ?? "Falha ao adicionar.");
        return;
      }
      setAddInstrumentId("");
      await loadWatchlist();
      await loadCandidates();
    } catch {
      setLoadError("Erro de rede ao adicionar instrumento.");
    }
  };

  const onRemoveEntry = async (entryId: string) => {
    try {
      const res = await apiFetch(`/api/v1/watchlist/${entryId}`, { method: "DELETE" });
      if (!res.ok) return;
      if (selectedCandidateId?.startsWith(`cand-${entryId}-`)) {
        setSelectedCandidateId(null);
        setDecisionContext(null);
      }
      await loadWatchlist();
      await loadCandidates();
    } catch {
      /* falha silenciosa em remoção — watchlist refrescará no próximo poll */
    }
  };

  const onChangePriority = async (entryId: string, priority: "low" | "medium" | "high") => {
    const res = await apiFetch(`/api/v1/watchlist/${entryId}`, {
      method: "PATCH",
      body: JSON.stringify({ priority }),
    });
    if (!res.ok) return;
    await loadWatchlist();
    await loadCandidates();
  };

  const selectCandidateForAnalysis = (c: CockpitCandidate) => {
    setSelectedCandidateId(c.id);
    if (c.instrumentId && c.timeframe && c.horizonte) {
      setDecisionContext({
        candidateId: c.id,
        instrumentId: c.instrumentId,
        symbolInternal: c.symbolInternal,
        timeframe: c.timeframe,
        horizonte: c.horizonte,
      });
    } else {
      setDecisionContext(null);
    }
  };

  const degradedSources = sources.filter((s) => s.state !== "operational");

  const alertsBlock = (
    <section style={card} aria-labelledby="alerts-title">
      <h2 id="alerts-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        Alertas de fontes
      </h2>
      {sourcesError ? (
        <p role="alert" style={{ color: "#b91c1c", margin: 0 }}>
          {sourcesError}
        </p>
      ) : degradedSources.length === 0 ? (
        <p style={{ color: "#64748b", margin: 0, fontSize: "0.875rem" }}>Sem alertas — todas operacionais.</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "#92400e" }}>
          {degradedSources.map((s) => (
            <li key={s.connectorId}>
              {s.connectorId}: {stateLabel(s.state)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  const sourcesBlock = (
    <section style={card} aria-labelledby="sources-title">
      <h2 id="sources-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        Estado das fontes
      </h2>
      {sources.length === 0 ? (
        <p style={{ color: "#64748b", margin: 0, fontSize: "0.875rem" }}>Sem fontes registadas.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {sources.map((s) => {
            const st = stateStyles(s.state);
            return (
              <li
                key={s.connectorId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.45rem 0.5rem",
                  borderRadius: 6,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ fontWeight: 600 }}>{s.connectorId}</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.15rem 0.45rem", borderRadius: 999, ...st }}>
                  {stateLabel(s.state)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

  const watchlistBlock = (
    <section style={card} aria-labelledby="wl-title">
      <h2 id="wl-title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
        Lista monitorizada
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "0.75rem", alignItems: "center" }}>
        <label style={{ fontSize: "0.8rem", color: "#475569" }}>
          Mercado
          <select
            value={filterMarket}
            onChange={(e) => setFilterMarket(e.target.value)}
            style={{ marginLeft: 6, padding: "0.25rem 0.5rem" }}
          >
            {markets.map((m) => (
              <option key={m} value={m}>
                {m === "all" ? "Todos" : m}
              </option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: "0.8rem", color: "#475569" }}>
          Prioridade
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as typeof filterPriority)}
            style={{ marginLeft: 6, padding: "0.25rem 0.5rem" }}
          >
            <option value="all">Todas</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </label>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: "0.75rem",
          padding: "0.5rem",
          background: "#f1f5f9",
          borderRadius: 6,
        }}
      >
        <select
          value={addInstrumentId}
          onChange={(e) => setAddInstrumentId(e.target.value)}
          style={{ flex: "1 1 160px", minWidth: 140, padding: "0.35rem" }}
          aria-label="Instrumento do catálogo"
        >
          <option value="">— Catálogo —</option>
          {catalog.map((i) => (
            <option key={i.id} value={i.id}>
              {i.symbolInternal} ({i.market})
            </option>
          ))}
        </select>
        <select
          value={addPriority}
          onChange={(e) => setAddPriority(e.target.value as typeof addPriority)}
          style={{ padding: "0.35rem" }}
          aria-label="Prioridade ao adicionar"
        >
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>
        <button type="button" onClick={() => void onAddWatchlist()} style={{ padding: "0.35rem 0.75rem" }}>
          Adicionar
        </button>
      </div>
      {loadError ? (
        <p role="alert" style={{ color: "#b91c1c", fontSize: "0.875rem" }}>
          {loadError}
        </p>
      ) : null}

      {filteredWatchlist.length === 0 ? (
        <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>Sem linhas (ou filtro sem resultados).</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredWatchlist.map((w) => {
            const tick = tickBySymbol.get(w.symbolInternal);
            const price =
              tick != null
                ? tick.close.toFixed(5)
                : w.lastClose != null
                  ? w.lastClose.toFixed(5)
                  : "—";
            const changeHint = tick ? `WS ${tick.timeframe}` : w.lastTimeframe ? `OHLC ${w.lastTimeframe}` : "Sem cotação";
            const changeStr =
              w.changePercent != null
                ? `${w.changePercent >= 0 ? "+" : ""}${w.changePercent.toFixed(2)}%`
                : null;
            const changeColor = w.changePercent == null ? "#64748b" : w.changePercent >= 0 ? "#166534" : "#991b1b";

            return (
              <li
                key={w.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  padding: "0.5rem 0.6rem",
                  background: "#fafafa",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{w.symbolInternal}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {w.market} · {changeHint}
                    </div>
                    <div style={{ fontSize: "0.9rem", marginTop: 4, display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>{price}</span>
                      {changeStr != null ? (
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: changeColor, fontVariantNumeric: "tabular-nums" }}>
                          {changeStr}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                    <select
                      value={w.priority}
                      onChange={(e) => void onChangePriority(w.id, e.target.value as typeof w.priority)}
                      aria-label={`Prioridade ${w.symbolInternal}`}
                      style={{ fontSize: "0.75rem", padding: "0.2rem" }}
                    >
                      <option value="high">Alta</option>
                      <option value="medium">Média</option>
                      <option value="low">Baixa</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => void onRemoveEntry(w.id)}
                      style={{ fontSize: "0.75rem", color: "#991b1b", background: "none", border: "none", cursor: "pointer" }}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

  const candidatesBlock = (
    <section style={card} aria-labelledby="cand-title">
      <h2 id="cand-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        Candidatos (motor)
      </h2>
      {candidatesPayload ? (
        <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.5rem" }}>
          Política: <strong>{candidatesPayload.policy}</strong>
          {candidatesPayload.suppressionReason ? (
            <>
              {" "}
              · suprimido: <strong>{candidatesPayload.suppressionReason}</strong>
            </>
          ) : null}
        </p>
      ) : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "0.6rem", alignItems: "center" }}>
        <label style={{ fontSize: "0.75rem", color: "#475569" }}>
          TF
          <select
            value={tfFilter}
            onChange={(e) => setTfFilter(e.target.value)}
            style={{ marginLeft: 4, padding: "0.2rem 0.4rem" }}
          >
            <option value="all">Todos</option>
            <option value="M15">M15</option>
            <option value="H1">H1</option>
          </select>
        </label>
        <label style={{ fontSize: "0.75rem", color: "#475569" }}>
          Horizonte
          <select
            value={horizonFilter}
            onChange={(e) => setHorizonFilter(e.target.value)}
            style={{ marginLeft: 4, padding: "0.2rem 0.4rem" }}
          >
            <option value="all">Todos</option>
            <option value="dia">dia</option>
            <option value="semana">semana</option>
          </select>
        </label>
        <label style={{ fontSize: "0.75rem", color: "#475569" }}>
          Ordenar
          <select
            value={candidateSort}
            onChange={(e) => setCandidateSort(e.target.value as CandidateSortBy)}
            style={{ marginLeft: 4, padding: "0.2rem 0.4rem" }}
          >
            <option value="priority">Prioridade</option>
            <option value="time">Tempo</option>
          </select>
        </label>
      </div>
      {!candidatesPayload ? (
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>A carregar…</p>
      ) : filteredCandidates.length === 0 ? (
        <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>Sem candidatos para o filtro actual.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {filteredCandidates.map((c) => {
            const selected = c.id === selectedCandidateId;
            const uncertain = c.certainty === "uncertain";
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => selectCandidateForAnalysis(c)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.5rem 0.6rem",
                    borderRadius: 6,
                    border: selected ? "2px solid #4f46e5" : "1px solid #e2e8f0",
                    background: uncertain ? "#fffbeb" : selected ? "#eef2ff" : "#fff",
                    cursor: "pointer",
                    boxShadow: uncertain ? "inset 0 0 0 1px #fcd34d" : undefined,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{c.symbolInternal}</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    {c.timeframe ?? "—"} · {c.horizonte ?? "—"}
                    {uncertain ? " · incerto" : ""}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

  const detailBlock = (
    <section
      style={{
        ...card,
        minHeight: vp === "wide" ? 280 : 160,
        borderStyle: selectedCandidate ? "solid" : "dashed",
        borderColor: selectedCandidate ? "#cbd5e1" : "#94a3b8",
      }}
      aria-labelledby="detail-title"
    >
      <h2 id="detail-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        Detalhe do candidato
      </h2>
      {!selectedCandidate ? (
        <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>Seleccione um candidato para análise (FR8).</p>
      ) : (
        <>
          <div style={{ marginBottom: "0.75rem" }}>
            <span style={chip}>TF: {selectedCandidate.timeframe ?? "—"}</span>
            <span style={{ ...chip, background: "#fce7f3", color: "#9d174d" }}>
              Horizonte: {selectedCandidate.horizonte ?? "—"}
            </span>
            {selectedCandidate.certainty === "uncertain" ? (
              <span style={{ ...chip, background: "#fef3c7", color: "#92400e" }}>Incerto</span>
            ) : (
              <span style={{ ...chip, background: "#d1fae5", color: "#065f46" }}>Normal</span>
            )}
          </div>
          <p style={{ fontSize: "0.875rem", color: "#334155", margin: 0 }}>
            Instrumento <strong>{selectedCandidate.symbolInternal}</strong>
          </p>
          {decisionContext ? (
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem" }}>
              Janela de decisão: {decisionContext.timeframe} / {decisionContext.horizonte} (contexto associado).
            </p>
          ) : null}
        </>
      )}
    </section>
  );

  const assistantBlock = (
    <section
      style={{
        ...card,
        background: "#f8fafc",
        minHeight: 200,
      }}
    >
      <AssistantPanel decisionContext={decisionContext} />
    </section>
  );

  const riskBlock = <RiskPanel decisionContext={decisionContext} />;

  const executionBlock = (
    <section style={card} aria-labelledby="exec-section-title">
      <h2 id="exec-section-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        Execução demo
      </h2>
      <ExecutionPanel
        decisionContext={decisionContext}
        onIntentSubmitted={(intent) => setLastOrderIntentId(intent.id)}
      />
    </section>
  );

  const decisionFormBlock = (
    <section style={card} aria-labelledby="dec-form-section-title">
      <h2 id="dec-form-section-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        Decisão
      </h2>
      <DecisionForm
        decisionContext={decisionContext}
        orderIntentId={lastOrderIntentId}
        onDecisionRecorded={() => setLastOrderIntentId(undefined)}
      />
    </section>
  );

  const historyBlock = (
    <section style={card} aria-labelledby="hist-section-title">
      <h2 id="hist-section-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        Histórico
      </h2>
      <DecisionHistoryPanel />
    </section>
  );

  const metricsBlock = (
    <section style={card} aria-labelledby="metrics-section-title">
      <h2 id="metrics-section-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        Métricas
      </h2>
      <MetricsPanel />
    </section>
  );

  const apiErrorBlock = apiError ? (
    <div style={{ marginBottom: "0.75rem" }}>
      <ApiErrorDisplay
        error={apiError}
        title="Erro na operação"
        variant="inline"
      />
    </div>
  ) : null;

  const ticksStrip =
    liveTicks.length > 0 ? (
      <section style={{ ...card, padding: "0.6rem 1rem" }} aria-label="Últimos ticks">
        <span style={{ fontSize: "0.75rem", color: "#64748b", marginRight: 8 }}>Ticks</span>
        {liveTicks.slice(0, 6).map((t) => (
          <span key={t.symbolInternal} style={{ fontSize: "0.75rem", marginRight: 12, fontVariantNumeric: "tabular-nums" }}>
            {t.symbolInternal} {t.close.toFixed(5)}
          </span>
        ))}
      </section>
    ) : null;

  /** UX-DR9: &lt;768 lista + alertas em primeiro plano; ≥1024 três colunas. */
  const gridStyle: CSSProperties =
    vp === "wide"
      ? {
          display: "grid",
          gridTemplateColumns: "minmax(240px, 280px) minmax(0, 1fr) minmax(200px, 260px)",
          gap: "1rem",
          alignItems: "start",
        }
      : vp === "mid"
        ? {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            alignItems: "start",
          }
        : {
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          };

  return (
    <main style={{ maxWidth: 1400, margin: "0 auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Cockpit</h1>

      {/* FR36/UX-DR12: erro global com requestId copiável */}
      {apiErrorBlock}

      {vp === "narrow" ? (
        <>
          {alertsBlock}
          {watchlistBlock}
          {ticksStrip}
          {candidatesBlock}
          {detailBlock}
          {riskBlock}
          {executionBlock}
          {decisionFormBlock}
          {assistantBlock}
          {metricsBlock}
          {historyBlock}
          {sourcesBlock}
        </>
      ) : vp === "mid" ? (
        <>
          <div style={{ ...gridStyle, marginBottom: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {alertsBlock}
              {watchlistBlock}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {ticksStrip}
              {candidatesBlock}
              {detailBlock}
              {riskBlock}
              {executionBlock}
              {decisionFormBlock}
              {assistantBlock}
            </div>
          </div>
          {metricsBlock}
          {historyBlock}
          {sourcesBlock}
        </>
      ) : (
        <>
          {ticksStrip ? <div style={{ marginBottom: "1rem" }}>{ticksStrip}</div> : null}
          <div style={gridStyle}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {alertsBlock}
              {watchlistBlock}
              {sourcesBlock}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {candidatesBlock}
              {detailBlock}
              {metricsBlock}
              {historyBlock}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {riskBlock}
              {executionBlock}
              {decisionFormBlock}
              {assistantBlock}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
