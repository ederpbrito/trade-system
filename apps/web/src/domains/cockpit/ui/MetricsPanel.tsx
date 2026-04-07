/**
 * MetricsPanel — FR31.
 * Painel de métricas MVP: agregados de decisões e execuções demo.
 */
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../shared/http/api-client";

type DecisionMetrics = {
  totalDecisions: number;
  byDecision: { operar: number; nao_operar: number };
  operateRate: number;
  byMode: { demo: number; production: number };
  totalIntents: number;
  filledIntents: number;
  fillRate: number;
  period: { from: string | null; to: string | null };
};

const statCard: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0.6rem 0.75rem",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  minWidth: 80,
  flex: "1 1 80px",
};

const statValue: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#0f172a",
  fontVariantNumeric: "tabular-nums",
};

const statLabel: React.CSSProperties = {
  fontSize: "0.68rem",
  color: "#64748b",
  textAlign: "center",
  marginTop: 2,
};

function pct(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function MetricsPanel() {
  const [metrics, setMetrics] = useState<DecisionMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/v1/metrics/summary");
      if (!res.ok) {
        setError("Não foi possível carregar as métricas.");
        return;
      }
      const data = (await res.json()) as { summary: DecisionMetrics };
      setMetrics(data.summary);
    } catch {
      setError("Erro de rede ao carregar métricas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section aria-labelledby="metrics-title">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h3 id="metrics-title" style={{ fontSize: "0.95rem", color: "#0f172a", margin: 0 }}>
          Métricas demo (FR31)
        </h3>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          style={{
            fontSize: "0.72rem",
            padding: "0.2rem 0.5rem",
            border: "1px solid #cbd5e1",
            borderRadius: 4,
            background: "#f8fafc",
            cursor: loading ? "not-allowed" : "pointer",
            color: "#475569",
          }}
          aria-label="Actualizar métricas"
        >
          {loading ? "…" : "↺"}
        </button>
      </div>

      {error ? (
        <p role="alert" style={{ color: "#b91c1c", fontSize: "0.875rem", margin: 0 }}>
          {error}
        </p>
      ) : loading && !metrics ? (
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>A carregar…</p>
      ) : !metrics ? null : (
        <>
          {metrics.totalDecisions === 0 && metrics.totalIntents === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
              Sem dados ainda. Registe decisões e execute intenções demo para ver métricas.
            </p>
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "0.75rem" }}>
                <div style={statCard}>
                  <span style={statValue}>{metrics.totalDecisions}</span>
                  <span style={statLabel}>Decisões</span>
                </div>
                <div style={statCard}>
                  <span style={{ ...statValue, color: "#166534" }}>{metrics.byDecision.operar}</span>
                  <span style={statLabel}>Operar</span>
                </div>
                <div style={statCard}>
                  <span style={{ ...statValue, color: "#92400e" }}>{metrics.byDecision.nao_operar}</span>
                  <span style={statLabel}>Não operar</span>
                </div>
                <div style={statCard}>
                  <span style={{ ...statValue, color: "#4f46e5" }}>{pct(metrics.operateRate)}</span>
                  <span style={statLabel}>Taxa operar</span>
                </div>
                <div style={statCard}>
                  <span style={statValue}>{metrics.totalIntents}</span>
                  <span style={statLabel}>Intenções</span>
                </div>
                <div style={statCard}>
                  <span style={{ ...statValue, color: "#0891b2" }}>{pct(metrics.fillRate)}</span>
                  <span style={statLabel}>Taxa fill</span>
                </div>
              </div>

              {metrics.period.from ? (
                <p style={{ fontSize: "0.68rem", color: "#94a3b8", margin: 0 }}>
                  Período: {formatDate(metrics.period.from)} — {formatDate(metrics.period.to)}
                  {" · "}
                  Demo: {metrics.byMode.demo} · Prod: {metrics.byMode.production}
                </p>
              ) : null}
            </>
          )}
        </>
      )}
    </section>
  );
}
