/**
 * FR24 — comparador de versões/experimentos na UI.
 * Tabela/cartões lado a lado com métricas definidas no produto.
 */
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { apiFetch } from "../../../shared/http/api-client";

type ExperimentMetrics = {
  profitFactorProxy: number;
  simulatedDrawdown: number;
  winRate: number;
  totalTrades: number;
};

type ExperimentRun = {
  id: string;
  policyVersion: number;
  datasetHash: string;
  metrics: ExperimentMetrics;
  artifactPath: string | null;
  label: string | null;
  trainingJobId: string | null;
  createdAt: string;
};

type TrainingJob = {
  id: string;
  status: "queued" | "running" | "success" | "failed";
  policyVersion: number | null;
  createdAt: string;
  finishedAt: string | null;
  errorMessage: string | null;
};

const card: CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: "1rem",
  background: "#fff",
};

const th: CSSProperties = {
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  background: "#f1f5f9",
  fontWeight: 600,
  fontSize: "0.8rem",
  color: "#475569",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const td: CSSProperties = {
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  color: "#0f172a",
  borderBottom: "1px solid #f1f5f9",
  fontVariantNumeric: "tabular-nums",
};

const statusBadge: Record<TrainingJob["status"], CSSProperties> = {
  queued: { background: "#f1f5f9", color: "#475569" },
  running: { background: "#dbeafe", color: "#1e40af" },
  success: { background: "#dcfce7", color: "#166534" },
  failed: { background: "#fee2e2", color: "#991b1b" },
};

function fmt(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function MetricCell({ value, highlight }: { value: number; highlight?: boolean }) {
  return (
    <td style={{ ...td, fontWeight: highlight ? 700 : 400, color: highlight ? "#4f46e5" : td.color }}>
      {fmt(value)}
    </td>
  );
}

export function ExperimentsPage() {
  const [experiments, setExperiments] = useState<ExperimentRun[]>([]);
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expRes, jobRes] = await Promise.all([
        apiFetch("/api/v1/experiments"),
        apiFetch("/api/v1/training-jobs"),
      ]);
      if (!expRes.ok) {
        setError("Não foi possível carregar os experimentos.");
        return;
      }
      const expData = (await expRes.json()) as { experiments: ExperimentRun[] };
      setExperiments(expData.experiments);
      if (jobRes.ok) {
        const jobData = (await jobRes.json()) as { jobs: TrainingJob[] };
        setJobs(jobData.jobs);
      }
    } catch {
      setError("Erro de rede ao carregar experimentos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runTraining = async () => {
    setJobLoading(true);
    try {
      const res = await apiFetch("/api/v1/training-jobs", { method: "POST" });
      if (!res.ok) {
        setError("Falha ao iniciar treino.");
        return;
      }
      await load();
    } catch {
      setError("Erro de rede ao iniciar treino.");
    } finally {
      setJobLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const compared = experiments.filter((e) => selected.has(e.id));

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Experimentos e comparação (FR24)</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => void runTraining()}
            disabled={jobLoading}
            style={{
              padding: "0.4rem 0.9rem",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: jobLoading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              opacity: jobLoading ? 0.7 : 1,
            }}
            aria-label="Iniciar ciclo de treino em paper/demo"
          >
            {jobLoading ? "A treinar…" : "▶ Treinar (paper/demo)"}
          </button>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            style={{
              padding: "0.4rem 0.75rem",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              background: "#f8fafc",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              color: "#475569",
            }}
            aria-label="Actualizar lista de experimentos"
          >
            {loading ? "…" : "↺"}
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" style={{ color: "#b91c1c", marginBottom: "1rem" }}>
          {error}
        </p>
      ) : null}

      {/* Jobs recentes */}
      {jobs.length > 0 ? (
        <section style={{ ...card, marginBottom: "1rem" }} aria-labelledby="jobs-title">
          <h2 id="jobs-title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
            Jobs de treino recentes (FR22)
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>ID</th>
                  <th style={th}>Estado</th>
                  <th style={th}>Política v.</th>
                  <th style={th}>Criado</th>
                  <th style={th}>Concluído</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 5).map((job) => (
                  <tr key={job.id}>
                    <td style={td}>{job.id.slice(0, 8)}…</td>
                    <td style={td}>
                      <span
                        style={{
                          ...statusBadge[job.status],
                          padding: "0.15rem 0.5rem",
                          borderRadius: 999,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td style={td}>{job.policyVersion ?? "—"}</td>
                    <td style={td}>{fmtDate(job.createdAt)}</td>
                    <td style={td}>{job.finishedAt ? fmtDate(job.finishedAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Lista de experimentos com selecção para comparação */}
      <section style={{ ...card, marginBottom: "1rem" }} aria-labelledby="exp-list-title">
        <h2 id="exp-list-title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
          Experimentos (FR23) — seleccione para comparar
        </h2>
        {loading && experiments.length === 0 ? (
          <p style={{ color: "#64748b" }}>A carregar…</p>
        ) : experiments.length === 0 ? (
          <p style={{ color: "#64748b", margin: 0 }}>
            Sem experimentos. Clique em "Treinar (paper/demo)" para criar o primeiro.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...th, width: 32 }}></th>
                  <th style={th}>Rótulo / ID</th>
                  <th style={th}>Política v.</th>
                  <th style={th}>Dataset hash</th>
                  <th style={th}>Profit Factor proxy</th>
                  <th style={th}>Drawdown sim.</th>
                  <th style={th}>Win Rate</th>
                  <th style={th}>Trades</th>
                  <th style={th}>Data</th>
                </tr>
              </thead>
              <tbody>
                {experiments.map((exp) => {
                  const isSelected = selected.has(exp.id);
                  return (
                    <tr
                      key={exp.id}
                      style={{ background: isSelected ? "#eef2ff" : undefined, cursor: "pointer" }}
                      onClick={() => toggleSelect(exp.id)}
                    >
                      <td style={{ ...td, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(exp.id)}
                          aria-label={`Seleccionar experimento ${exp.label ?? exp.id}`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td style={td}>
                        <div style={{ fontWeight: 600 }}>{exp.label ?? "—"}</div>
                        <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{exp.id.slice(0, 8)}…</div>
                      </td>
                      <td style={{ ...td, fontWeight: 700 }}>v{exp.policyVersion}</td>
                      <td style={{ ...td, fontSize: "0.72rem", color: "#64748b" }}>{exp.datasetHash}</td>
                      <td style={td}>{fmt(exp.metrics.profitFactorProxy)}</td>
                      <td style={td}>{fmt(exp.metrics.simulatedDrawdown * 100)}%</td>
                      <td style={td}>{fmt(exp.metrics.winRate * 100)}%</td>
                      <td style={td}>{exp.metrics.totalTrades}</td>
                      <td style={{ ...td, fontSize: "0.75rem", color: "#64748b" }}>{fmtDate(exp.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Comparador lado a lado — FR24 */}
      {compared.length >= 2 ? (
        <section style={card} aria-labelledby="compare-title">
          <h2 id="compare-title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
            Comparação lado a lado ({compared.length} experimentos)
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Métrica</th>
                  {compared.map((e) => (
                    <th key={e.id} style={th}>
                      {e.label ?? `Exp ${e.id.slice(0, 6)}`}
                      <div style={{ fontSize: "0.7rem", fontWeight: 400, color: "#94a3b8" }}>
                        Política v{e.policyVersion}
                      </div>
                    </th>
                  ))}
                  <th style={th}>Melhor (por linha)</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    { key: "profitFactorProxy", label: "Profit Factor proxy", higherBetter: true },
                    { key: "simulatedDrawdown", label: "Drawdown simulado", higherBetter: false },
                    { key: "winRate", label: "Win Rate", higherBetter: true },
                    { key: "totalTrades", label: "Total trades", higherBetter: true },
                  ] as const
                ).map(({ key, label, higherBetter }) => {
                  const bestVal = compared.reduce((best, e) => {
                    const v = e.metrics[key];
                    if (higherBetter) return v > best ? v : best;
                    return v < best ? v : best;
                  }, higherBetter ? -Infinity : Infinity);

                  return (
                    <tr key={key}>
                      <td style={{ ...td, fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>{label}</td>
                      {compared.map((e) => {
                        const v = e.metrics[key];
                        const isBest = v === bestVal;
                        const display = key === "simulatedDrawdown" || key === "winRate" ? `${fmt(v * 100)}%` : fmt(v);
                        return (
                          <td
                            key={e.id}
                            style={{
                              ...td,
                              fontWeight: isBest ? 700 : 400,
                              color: isBest ? "#166534" : td.color,
                              background: isBest ? "#f0fdf4" : undefined,
                            }}
                          >
                            {display}
                            {isBest ? " ✓" : ""}
                          </td>
                        );
                      })}
                      <td style={{ ...td, fontSize: "0.75rem", color: "#64748b" }}>
                        {higherBetter ? `↑ ${key === "simulatedDrawdown" || key === "winRate" ? `${fmt(bestVal * 100)}%` : fmt(bestVal)}` : `↓ ${fmt(bestVal * 100)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.75rem", margin: "0.75rem 0 0" }}>
            Métricas calculadas em ambiente paper/demo. Não constituem garantia de desempenho em produção.
          </p>
        </section>
      ) : experiments.length >= 2 ? (
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
          Seleccione pelo menos 2 experimentos para comparar.
        </p>
      ) : null}
    </main>
  );
}
