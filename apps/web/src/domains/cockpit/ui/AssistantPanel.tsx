/**
 * AssistantPanel — FR9–FR12 (Épico 6)
 * Painel do assistente de decisão contextual:
 *  - 6-1: Explicação da tese da oportunidade (secções estruturadas)
 *  - 6-2: Deteção e apresentação de conflito entre janelas (duas colunas + severidade)
 *  - 6-3: Relação com limites de risco e plano (dados vindos da API)
 *  - 6-4: UI de interação estruturada; conteúdo actualiza ao mudar candidato sem perder estado de sessão
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { apiFetch } from "../../../shared/http/api-client";

// ─── Tipos do contrato JSON (versionável — AC 6-1) ───────────────────────────

type ThesisSection = {
  id: string;
  title: string;
  content: string;
};

type ConflictSeverity = "none" | "low" | "medium" | "high";

type WindowConflict = {
  shortTermNarrative: string;
  longTermNarrative: string;
  severity: ConflictSeverity;
};

type RiskRelation = {
  hasLimits: boolean;
  adherenceSummary: string | null;
  headroomPositionSize: number | null;
  headroomDailyLoss: number | null;
};

type AssistantThesisResponse = {
  schemaVersion: string;
  symbolInternal: string;
  timeframe: string;
  horizonte: string;
  sections: ThesisSection[];
  conflict: WindowConflict;
  riskRelation: RiskRelation;
  generatedAt: string;
};

// ─── Props ────────────────────────────────────────────────────────────────────

type DecisionContext = {
  candidateId: string;
  instrumentId: string;
  symbolInternal: string;
  timeframe: string;
  horizonte: string;
};

type Props = {
  decisionContext: DecisionContext | null;
};

// ─── Helpers de estilo ────────────────────────────────────────────────────────

const severityColor: Record<ConflictSeverity, { bg: string; color: string; label: string }> = {
  none: { bg: "#f0fdf4", color: "#166534", label: "Sem conflito" },
  low: { bg: "#fefce8", color: "#854d0e", label: "Conflito baixo" },
  medium: { bg: "#fff7ed", color: "#9a3412", label: "Conflito médio" },
  high: { bg: "#fef2f2", color: "#991b1b", label: "Conflito alto" },
};

const card: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  padding: "0.75rem",
  background: "#fff",
  marginBottom: "0.75rem",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "#334155",
  marginBottom: "0.35rem",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const bodyText: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#475569",
  lineHeight: 1.5,
  margin: 0,
};

const chip: React.CSSProperties = {
  display: "inline-block",
  fontSize: "0.7rem",
  fontWeight: 600,
  padding: "0.15rem 0.45rem",
  borderRadius: 999,
  marginRight: 4,
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function AssistantPanel({ decisionContext }: Props) {
  const titleId = useId();
  const [thesis, setThesis] = useState<AssistantThesisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FR12/AC 6-4: rastrear candidateId anterior para não perder estado de sessão
  // quando o contexto muda (ex: painel expandido/colapsado pelo utilizador).
  const prevCandidateId = useRef<string | null>(null);
  // AbortController para cancelar pedidos em voo ao mudar candidato (evita race conditions)
  const abortRef = useRef<AbortController | null>(null);

  // Estado de sessão do utilizador que não deve ser perdido ao mudar candidato
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["resumo"]));

  const loadThesis = useCallback(async (ctx: DecisionContext) => {
    // Cancelar pedido anterior se ainda estiver em voo
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        instrumentId: ctx.instrumentId,
        symbolInternal: ctx.symbolInternal,
        timeframe: ctx.timeframe,
        horizonte: ctx.horizonte,
      });
      const res = await apiFetch(`/api/v1/assistant/thesis?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setError(j?.error?.message ?? "Erro ao carregar análise do assistente.");
        setThesis(null);
        return;
      }
      const data = (await res.json()) as { thesis: AssistantThesisResponse };
      setThesis(data.thesis);
    } catch (err) {
      // Ignorar erros de abort — são intencionais ao mudar candidato
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Erro de rede ao carregar análise do assistente.");
      setThesis(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // AC 6-4: conteúdo actualiza ao mudar candidato; estado de sessão (expandedSections) preservado
  useEffect(() => {
    if (!decisionContext) {
      setThesis(null);
      setError(null);
      prevCandidateId.current = null;
      return;
    }
    if (decisionContext.candidateId !== prevCandidateId.current) {
      prevCandidateId.current = decisionContext.candidateId;
      void loadThesis(decisionContext);
    }
  }, [decisionContext, loadThesis]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Render: sem contexto ─────────────────────────────────────────────────

  if (!decisionContext) {
    return (
      <section aria-labelledby={titleId}>
        <h2 id={titleId} style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
          Assistente
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: 0 }}>
          Seleccione um candidato para ver a análise do assistente.
        </p>
      </section>
    );
  }

  // ─── Render: a carregar ───────────────────────────────────────────────────

  if (loading) {
    return (
      <section aria-labelledby={titleId} aria-busy="true">
        <h2 id={titleId} style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
          Assistente
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#64748b" }}>A analisar…</p>
      </section>
    );
  }

  // ─── Render: erro ─────────────────────────────────────────────────────────

  if (error) {
    return (
      <section aria-labelledby={titleId}>
        <h2 id={titleId} style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
          Assistente
        </h2>
        <p role="alert" style={{ fontSize: "0.875rem", color: "#b91c1c", margin: 0 }}>
          {error}
        </p>
        <button
          type="button"
          onClick={() => void loadThesis(decisionContext)}
          style={{ marginTop: "0.5rem", fontSize: "0.8rem", padding: "0.3rem 0.6rem", cursor: "pointer" }}
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  // ─── Render: sem tese ainda ───────────────────────────────────────────────

  if (!thesis) return null;

  const conflictStyle = severityColor[thesis.conflict.severity];

  return (
    <section aria-labelledby={titleId}>
      <h2 id={titleId} style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
        Assistente
      </h2>

      {/* Contexto activo */}
      <div style={{ marginBottom: "0.75rem", display: "flex", flexWrap: "wrap", gap: 4 }}>
        <span style={{ ...chip, background: "#e0e7ff", color: "#3730a3" }}>{thesis.symbolInternal}</span>
        <span style={{ ...chip, background: "#f1f5f9", color: "#334155" }}>{thesis.timeframe}</span>
        <span style={{ ...chip, background: "#fce7f3", color: "#9d174d" }}>{thesis.horizonte}</span>
        <span style={{ fontSize: "0.7rem", color: "#94a3b8", alignSelf: "center" }}>
          v{thesis.schemaVersion}
        </span>
      </div>

      {/* FR9: Secções da tese (resumo, fatores, incerteza) */}
      {thesis.sections.map((section) => {
        const expanded = expandedSections.has(section.id);
        return (
          <div key={section.id} style={card}>
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              aria-expanded={expanded}
              style={{
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={sectionTitle}>{section.title}</span>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{expanded ? "▲" : "▼"}</span>
            </button>
            {expanded ? (
              <p style={{ ...bodyText, marginTop: "0.4rem" }}>{section.content}</p>
            ) : null}
          </div>
        );
      })}

      {/* FR10/UX-DR5: Conflito entre janelas — duas colunas com narrativa e severidade */}
      <div
        style={{
          ...card,
          background: conflictStyle.bg,
          borderColor: conflictStyle.color + "44",
        }}
        aria-label="Conflito entre janelas"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={sectionTitle}>Conflito entre janelas</span>
          <span
            style={{
              ...chip,
              background: conflictStyle.bg,
              color: conflictStyle.color,
              border: `1px solid ${conflictStyle.color}55`,
            }}
          >
            {conflictStyle.label}
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
          }}
        >
          <div>
            <p style={{ ...sectionTitle, marginBottom: "0.25rem", textTransform: "none", letterSpacing: 0 }}>
              Curto prazo
            </p>
            <p style={bodyText}>{thesis.conflict.shortTermNarrative}</p>
          </div>
          <div>
            <p style={{ ...sectionTitle, marginBottom: "0.25rem", textTransform: "none", letterSpacing: 0 }}>
              Longo prazo
            </p>
            <p style={bodyText}>{thesis.conflict.longTermNarrative}</p>
          </div>
        </div>
      </div>

      {/* FR11: Relação com limites de risco — dados vindos da API */}
      <div style={card} aria-label="Relação com limites de risco">
        <span style={sectionTitle}>Limites de risco</span>
        {thesis.riskRelation.hasLimits ? (
          <>
            {thesis.riskRelation.adherenceSummary ? (
              <p style={{ ...bodyText, marginTop: "0.4rem" }}>{thesis.riskRelation.adherenceSummary}</p>
            ) : null}
            {thesis.riskRelation.headroomPositionSize !== null ? (
              <div style={{ marginTop: "0.4rem", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    ...chip,
                    background: thesis.riskRelation.headroomPositionSize > 0 ? "#dcfce7" : "#fee2e2",
                    color: thesis.riskRelation.headroomPositionSize > 0 ? "#166534" : "#991b1b",
                    fontSize: "0.75rem",
                  }}
                >
                  Posição: {thesis.riskRelation.headroomPositionSize.toFixed(2)} disponível
                </span>
              </div>
            ) : null}
            {thesis.riskRelation.headroomDailyLoss !== null ? (
              <div style={{ marginTop: "0.25rem", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    ...chip,
                    background: thesis.riskRelation.headroomDailyLoss > 0 ? "#dcfce7" : "#fee2e2",
                    color: thesis.riskRelation.headroomDailyLoss > 0 ? "#166534" : "#991b1b",
                    fontSize: "0.75rem",
                  }}
                >
                  Perda diária: {thesis.riskRelation.headroomDailyLoss.toFixed(2)} disponível
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <p style={{ ...bodyText, marginTop: "0.4rem", color: "#94a3b8" }}>
            {thesis.riskRelation.adherenceSummary}
          </p>
        )}
      </div>

      {/* AC 6-4: disclaimer — mensagens não substituem checks de risco */}
      <p
        style={{
          fontSize: "0.72rem",
          color: "#94a3b8",
          margin: 0,
          borderTop: "1px solid #f1f5f9",
          paddingTop: "0.5rem",
        }}
        role="note"
      >
        Esta análise é gerada por regras determinísticas e não substitui os checks de risco nem constitui aconselhamento financeiro.
      </p>
    </section>
  );
}
