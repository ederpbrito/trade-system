/**
 * DecisionHistoryPanel — FR29, FR30.
 * Histórico consultável de decisões com filtros (FR30).
 * Trilha auditável de eventos (FR29).
 */
import { useCallback, useEffect, useId, useState } from "react";
import { apiFetch } from "../../../shared/http/api-client";

type DecisionRecord = {
  id: string;
  decision: string;
  symbolInternal: string;
  timeframe: string | null;
  horizonte: string | null;
  rationale: string;
  tagsJson: string | null;
  note: string | null;
  mode: string;
  createdAt: string;
};

type AuditEvent = {
  id: string;
  eventType: string;
  mode: string;
  timeframe: string | null;
  horizonte: string | null;
  correlationId: string | null;
  entityId: string | null;
  entityType: string | null;
  payloadJson: string;
  occurredAt: string;
};

type ActiveTab = "decisions" | "audit";

const cardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  padding: "0.5rem 0.75rem",
  background: "#fafafa",
  fontSize: "0.8rem",
};

const modeBadge = (mode: string): React.CSSProperties => ({
  display: "inline-block",
  padding: "0.1rem 0.4rem",
  borderRadius: 999,
  fontSize: "0.68rem",
  fontWeight: 700,
  background: mode === "demo" ? "#fef9c3" : "#fee2e2",
  color: mode === "demo" ? "#78350f" : "#991b1b",
  marginLeft: 4,
});

const decisionBadge = (decision: string): React.CSSProperties => ({
  display: "inline-block",
  padding: "0.1rem 0.4rem",
  borderRadius: 999,
  fontSize: "0.68rem",
  fontWeight: 700,
  background: decision === "operar" ? "#dcfce7" : "#fef3c7",
  color: decision === "operar" ? "#166534" : "#92400e",
});

export function DecisionHistoryPanel() {
  const idPrefix = useId();

  const [activeTab, setActiveTab] = useState<ActiveTab>("decisions");

  // Filtros de histórico (FR30)
  const [filterSymbol, setFilterSymbol] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [loadingDecisions, setLoadingDecisions] = useState(false);
  const [decisionsError, setDecisionsError] = useState<string | null>(null);

  const [selectedDecision, setSelectedDecision] = useState<DecisionRecord | null>(null);

  // Trilha auditável (FR29)
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const loadDecisions = useCallback(async () => {
    setLoadingDecisions(true);
    setDecisionsError(null);
    try {
      const params = new URLSearchParams();
      if (filterSymbol.trim()) params.set("symbolInternal", filterSymbol.trim());
      if (filterFrom) params.set("from", filterFrom);
      if (filterTo) params.set("to", filterTo);
      params.set("limit", "50");

      const res = await apiFetch(`/api/v1/decisions?${params.toString()}`);
      if (!res.ok) {
        setDecisionsError("Não foi possível carregar o histórico.");
        return;
      }
      const data = (await res.json()) as { decisions: DecisionRecord[] };
      setDecisions(data.decisions);
    } catch {
      setDecisionsError("Erro de rede ao carregar histórico.");
    } finally {
      setLoadingDecisions(false);
    }
  }, [filterSymbol, filterFrom, filterTo]);

  const loadAuditEvents = useCallback(async () => {
    setLoadingAudit(true);
    setAuditError(null);
    try {
      const res = await apiFetch("/api/v1/audit/events?limit=100");
      if (!res.ok) {
        setAuditError("Não foi possível carregar a trilha de auditoria.");
        return;
      }
      const data = (await res.json()) as { events: AuditEvent[] };
      setAuditEvents(data.events);
    } catch {
      setAuditError("Erro de rede ao carregar trilha.");
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "decisions") void loadDecisions();
    else void loadAuditEvents();
  }, [activeTab, loadDecisions, loadAuditEvents]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
    } catch {
      return iso;
    }
  };

  const parseTags = (tagsJson: string | null): string[] => {
    if (!tagsJson) return [];
    try {
      return JSON.parse(tagsJson) as string[];
    } catch {
      return [];
    }
  };

  return (
    <section aria-labelledby={`${idPrefix}-hist-title`}>
      <h3 id={`${idPrefix}-hist-title`} style={{ fontSize: "0.95rem", marginBottom: "0.5rem", color: "#0f172a" }}>
        Histórico e auditoria
      </h3>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>
        {(["decisions", "audit"] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setSelectedDecision(null);
            }}
            style={{
              padding: "0.4rem 0.75rem",
              fontSize: "0.8rem",
              fontWeight: activeTab === tab ? 700 : 400,
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #4f46e5" : "2px solid transparent",
              background: "none",
              cursor: "pointer",
              color: activeTab === tab ? "#4f46e5" : "#64748b",
            }}
            aria-selected={activeTab === tab}
          >
            {tab === "decisions" ? "Decisões (FR30)" : "Trilha (FR29)"}
          </button>
        ))}
      </div>

      {/* Tab: Histórico de decisões */}
      {activeTab === "decisions" && (
        <>
          {/* Filtros (FR30) */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "0.75rem", alignItems: "flex-end" }}>
            <label style={{ fontSize: "0.75rem", color: "#475569", display: "flex", flexDirection: "column", gap: 2 }}>
              Ativo
              <input
                type="text"
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                placeholder="ex: EURUSD"
                style={{ padding: "0.25rem 0.4rem", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: "0.8rem", width: 100 }}
              />
            </label>
            <label style={{ fontSize: "0.75rem", color: "#475569", display: "flex", flexDirection: "column", gap: 2 }}>
              De
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                style={{ padding: "0.25rem 0.4rem", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: "0.8rem" }}
              />
            </label>
            <label style={{ fontSize: "0.75rem", color: "#475569", display: "flex", flexDirection: "column", gap: 2 }}>
              Até
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                style={{ padding: "0.25rem 0.4rem", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: "0.8rem" }}
              />
            </label>
            <button
              type="button"
              onClick={() => void loadDecisions()}
              style={{
                padding: "0.3rem 0.75rem",
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Filtrar
            </button>
          </div>

          {decisionsError ? (
            <p role="alert" style={{ color: "#b91c1c", fontSize: "0.875rem" }}>
              {decisionsError}
            </p>
          ) : loadingDecisions ? (
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>A carregar…</p>
          ) : decisions.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
              Sem decisões registadas (ou filtro sem resultados).
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {decisions.map((d) => {
                const tags = parseTags(d.tagsJson);
                const isSelected = selectedDecision?.id === d.id;
                return (
                  <div key={d.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedDecision(isSelected ? null : d)}
                      style={{
                        ...cardStyle,
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        border: isSelected ? "1px solid #4f46e5" : "1px solid #e2e8f0",
                        background: isSelected ? "#eef2ff" : "#fafafa",
                      }}
                      aria-expanded={isSelected}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div>
                          <span style={decisionBadge(d.decision)}>
                            {d.decision === "operar" ? "Operar" : "Não operar"}
                          </span>
                          <span style={modeBadge(d.mode)}>{d.mode.toUpperCase()}</span>
                          <span style={{ marginLeft: 6, fontWeight: 600, fontSize: "0.8rem" }}>{d.symbolInternal}</span>
                          {d.timeframe ? (
                            <span style={{ marginLeft: 4, color: "#64748b", fontSize: "0.72rem" }}>
                              {d.timeframe}/{d.horizonte}
                            </span>
                          ) : null}
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                          {formatDate(d.createdAt)}
                        </span>
                      </div>
                    </button>

                    {/* Detalhe expandido */}
                    {isSelected && (
                      <div
                        style={{
                          padding: "0.6rem 0.75rem",
                          background: "#f8fafc",
                          border: "1px solid #4f46e5",
                          borderTop: "none",
                          borderRadius: "0 0 6px 6px",
                          fontSize: "0.8rem",
                        }}
                      >
                        <p style={{ margin: "0 0 6px", color: "#334155" }}>
                          <strong>Racional:</strong> {d.rationale}
                        </p>
                        {tags.length > 0 ? (
                          <p style={{ margin: "0 0 4px" }}>
                            <strong>Tags:</strong>{" "}
                            {tags.map((t) => (
                              <span
                                key={t}
                                style={{
                                  display: "inline-block",
                                  padding: "0.1rem 0.4rem",
                                  borderRadius: 999,
                                  background: "#e0e7ff",
                                  color: "#3730a3",
                                  fontSize: "0.68rem",
                                  fontWeight: 600,
                                  marginRight: 4,
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </p>
                        ) : null}
                        {d.note ? (
                          <p style={{ margin: "0 0 4px", color: "#64748b" }}>
                            <strong>Nota:</strong> {d.note}
                          </p>
                        ) : null}
                        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.68rem" }}>ID: {d.id}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Tab: Trilha auditável */}
      {activeTab === "audit" && (
        <>
          {auditError ? (
            <p role="alert" style={{ color: "#b91c1c", fontSize: "0.875rem" }}>
              {auditError}
            </p>
          ) : loadingAudit ? (
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>A carregar…</p>
          ) : auditEvents.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
              Sem eventos de auditoria registados.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {auditEvents.map((ev) => (
                <div key={ev.id} style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.1rem 0.4rem",
                          borderRadius: 4,
                          background: "#e0e7ff",
                          color: "#3730a3",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          marginRight: 6,
                        }}
                      >
                        {ev.eventType}
                      </span>
                      <span style={modeBadge(ev.mode)}>{ev.mode.toUpperCase()}</span>
                      {ev.timeframe ? (
                        <span style={{ marginLeft: 4, color: "#64748b", fontSize: "0.72rem" }}>
                          {ev.timeframe}/{ev.horizonte}
                        </span>
                      ) : null}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {formatDate(ev.occurredAt)}
                    </span>
                  </div>
                  {ev.correlationId ? (
                    <div style={{ marginTop: 3, color: "#94a3b8", fontSize: "0.68rem" }}>
                      correlationId: {ev.correlationId}
                    </div>
                  ) : null}
                  {ev.entityId ? (
                    <div style={{ color: "#94a3b8", fontSize: "0.68rem" }}>
                      {ev.entityType}: {ev.entityId}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
