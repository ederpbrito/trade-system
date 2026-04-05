import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../shared/http/api-client";
import { useMarketWebSocket } from "../../../shared/realtime/useMarketWebSocket";
import { useAuth } from "../../identity/context/AuthContext";

type SourceHealth = {
  connectorId: string;
  state: string;
  lastHeartbeatAt: string | null;
  latencyMs: number | null;
  updatedAt: string;
};

type PreviewResponse = {
  candidates: Array<{ id: string; symbolInternal: string; certainty: string }>;
  suppressionReason: string | null;
  policy: string;
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

/** NFR-I1: estado de fonte visível em ≤30s — *polling* 15s e eventos WS `source_health`. */
const HEALTH_POLL_MS = 15_000;

/** Alinhado ao mock de mercado — subscrição WS explícita (story 2-4). */
const COCKPIT_STREAM_SYMBOLS = ["EURUSD_TEST", "XAUUSD_TEST"] as const;

export function CockpitPage() {
  const { user } = useAuth();
  const streamSymbols = useMemo(() => [...COCKPIT_STREAM_SYMBOLS], []);
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [sourcesError, setSourcesError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);

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

  const loadPreview = useCallback(async () => {
    const res = await apiFetch("/api/v1/opportunities/candidates/preview");
    if (!res.ok) return;
    setPreview((await res.json()) as PreviewResponse);
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadHealth();
    const id = setInterval(() => void loadHealth(), HEALTH_POLL_MS);
    return () => clearInterval(id);
  }, [user, loadHealth]);

  useEffect(() => {
    if (!user) return;
    void loadPreview();
    const id = setInterval(() => void loadPreview(), HEALTH_POLL_MS);
    return () => clearInterval(id);
  }, [user, loadPreview]);

  const liveTicks = useMarketWebSocket(Boolean(user), streamSymbols);

  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Cockpit</h1>

      <section
        aria-labelledby="sources-title"
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          padding: "1.25rem",
          marginBottom: "1.25rem",
          background: "#fff",
        }}
      >
        <h2 id="sources-title" style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>
          Estado das fontes
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1rem", lineHeight: 1.5 }}>
          Indicador por conetor (FR26). Actualização automática a cada {HEALTH_POLL_MS / 1000}s e via WebSocket após
          sincronização mock.
        </p>
        {sourcesError ? (
          <p role="alert" style={{ color: "#b91c1c" }}>
            {sourcesError}
          </p>
        ) : null}
        {sources.length === 0 && !sourcesError ? (
          <p style={{ color: "#64748b", margin: 0 }}>Ainda sem fontes registadas. Execute uma sincronização mock na API.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {sources.map((s) => {
              const st = stateStyles(s.state);
              return (
                <li
                  key={s.connectorId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "0.6rem 0.75rem",
                    borderRadius: 6,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{s.connectorId}</span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.55rem",
                      borderRadius: 999,
                      background: st.bg,
                      color: st.color,
                    }}
                  >
                    {stateLabel(s.state)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section
        aria-labelledby="ticks-title"
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          padding: "1.25rem",
          marginBottom: "1.25rem",
          background: "#fff",
        }}
      >
        <h2 id="ticks-title" style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>
          Últimos ticks (WebSocket)
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.75rem", lineHeight: 1.5 }}>
          Envelope <code style={{ fontSize: "0.8rem" }}>{`{ type, payload, ts }`}</code>; ligação envia{" "}
          <code style={{ fontSize: "0.8rem" }}>subscribe</code> para {streamSymbols.join(", ")}. Agregação por símbolo
          (NFR-P2).
        </p>
        {liveTicks.length === 0 ? (
          <p style={{ color: "#64748b", margin: 0 }}>Sem ticks ainda. Sincronize o mock para publicar eventos.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#334155" }}>
            {liveTicks.map((t) => (
              <li key={t.symbolInternal}>
                {t.symbolInternal} · {t.timeframe} · fecho {t.close.toFixed(5)} · {t.tsOpen}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-labelledby="preview-title"
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          padding: "1.25rem",
          background: "#f8fafc",
        }}
      >
        <h2 id="preview-title" style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>
          Pré-visualização de oportunidades (política de degradação)
        </h2>
        {preview ? (
          <>
            <p style={{ color: "#475569", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              Política: <strong>{preview.policy}</strong>
              {preview.suppressionReason ? (
                <>
                  {" "}
                  · Suprimido: <strong>{preview.suppressionReason}</strong>
                </>
              ) : null}
            </p>
            {preview.candidates.length === 0 ? (
              <p style={{ color: "#64748b", margin: 0 }}>Sem candidatos (suprimidos ou sem instrumentos).</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#334155" }}>
                {preview.candidates.map((c) => (
                  <li key={c.id}>
                    {c.symbolInternal} — certeza: {c.certainty}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p style={{ color: "#64748b", margin: 0 }}>A carregar…</p>
        )}
      </section>
    </main>
  );
}
