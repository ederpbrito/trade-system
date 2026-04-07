/**
 * DecisionForm — FR20, UX-DR8.
 * Formulário de racional de decisão estruturado.
 * Campos: decisão (operar/não operar), motivo (obrigatório), tags (opcional), nota (opcional).
 */
import { useId, useState } from "react";
import { apiFetch } from "../../../shared/http/api-client";
import { UncertaintyDisclaimer } from "../../../shared/ui/UncertaintyDisclaimer";
import { ApiErrorDisplay } from "../../../shared/ui/ApiErrorDisplay";
import type { ApiError } from "../../../shared/ui/ApiErrorDisplay";

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

type Props = {
  decisionContext?: {
    candidateId: string;
    instrumentId: string;
    symbolInternal: string;
    timeframe: string;
    horizonte: string;
  } | null;
  orderIntentId?: string;
  onDecisionRecorded?: (decision: DecisionRecord) => void;
};

const DECISION_TAGS = [
  "tendência",
  "reversão",
  "suporte",
  "resistência",
  "momentum",
  "risco_baixo",
  "risco_alto",
  "aguardar",
  "confirmação_pendente",
];

const inputStyle: React.CSSProperties = {
  padding: "0.3rem 0.5rem",
  border: "1px solid #cbd5e1",
  borderRadius: 4,
  fontSize: "0.875rem",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#475569",
  fontWeight: 600,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

export function DecisionForm({ decisionContext, orderIntentId, onDecisionRecorded }: Props) {
  const idPrefix = useId();

  const [decision, setDecision] = useState<"operar" | "nao_operar">("operar");
  const [rationale, setRationale] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [lastDecision, setLastDecision] = useState<DecisionRecord | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionContext) return;
    if (!rationale.trim()) {
      setSubmitError({ message: "O racional é obrigatório." });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setLastDecision(null);

    try {
      const body: Record<string, unknown> = {
        decision,
        instrumentId: decisionContext.instrumentId,
        symbolInternal: decisionContext.symbolInternal,
        timeframe: decisionContext.timeframe,
        horizonte: decisionContext.horizonte,
        candidateId: decisionContext.candidateId,
        rationale: rationale.trim(),
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        note: note.trim() || undefined,
      };
      if (orderIntentId) body.orderIntentId = orderIntentId;

      const res = await apiFetch("/api/v1/decisions", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as { decision?: DecisionRecord; error?: ApiError };

      if (!res.ok) {
        setSubmitError(data.error ?? { message: "Falha ao registar decisão." });
        return;
      }

      if (data.decision) {
        setLastDecision(data.decision);
        setRationale("");
        setSelectedTags([]);
        setNote("");
        onDecisionRecorded?.(data.decision);
      }
    } catch {
      setSubmitError({ message: "Erro de rede ao registar decisão." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!decisionContext) {
    return (
      <section aria-label="Registo de decisão">
        <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", color: "#0f172a" }}>Registo de decisão</h3>
        <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
          Seleccione um candidato para registar a decisão.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby={`${idPrefix}-dec-title`}>
      <h3 id={`${idPrefix}-dec-title`} style={{ fontSize: "0.95rem", marginBottom: "0.5rem", color: "#0f172a" }}>
        Registo de decisão
      </h3>

      {/* FR32/UX-DR14: aviso de incerteza no fluxo de decisão */}
    <div style={{ marginBottom: "0.5rem" }}>
      <UncertaintyDisclaimer variant="compact" context={decisionContext?.symbolInternal} />
    </div>

    <form onSubmit={(e) => void handleSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: "0.8rem", color: "#334155", padding: "0.4rem 0.5rem", background: "#f1f5f9", borderRadius: 4 }}>
          <strong>{decisionContext.symbolInternal}</strong>
          {" · "}
          {decisionContext.timeframe} / {decisionContext.horizonte}
        </div>

        {/* Decisão */}
        <fieldset style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "0.5rem 0.75rem" }}>
          <legend style={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", padding: "0 4px" }}>
            Decisão
          </legend>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.875rem", cursor: "pointer" }}>
              <input
                type="radio"
                name={`${idPrefix}-decision`}
                value="operar"
                checked={decision === "operar"}
                onChange={() => setDecision("operar")}
              />
              <span style={{ color: "#166534", fontWeight: 600 }}>Operar</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.875rem", cursor: "pointer" }}>
              <input
                type="radio"
                name={`${idPrefix}-decision`}
                value="nao_operar"
                checked={decision === "nao_operar"}
                onChange={() => setDecision("nao_operar")}
              />
              <span style={{ color: "#92400e", fontWeight: 600 }}>Não operar</span>
            </label>
          </div>
        </fieldset>

        {/* Racional — obrigatório (UX-DR8) */}
        <label style={labelStyle} htmlFor={`${idPrefix}-rationale`}>
          Motivo / racional <span style={{ color: "#ef4444" }}>*</span>
          <textarea
            id={`${idPrefix}-rationale`}
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Descreva o motivo da decisão…"
            rows={3}
            required
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            aria-required="true"
          />
        </label>

        {/* Tags opcionais (UX-DR8) */}
        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", margin: "0 0 4px" }}>
            Tags (opcional)
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {DECISION_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: 999,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    border: active ? "1px solid #4f46e5" : "1px solid #cbd5e1",
                    background: active ? "#eef2ff" : "#f8fafc",
                    color: active ? "#3730a3" : "#475569",
                    cursor: "pointer",
                  }}
                  aria-pressed={active}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nota breve (UX-DR8) */}
        <label style={labelStyle} htmlFor={`${idPrefix}-note`}>
          Nota breve (opcional)
          <input
            id={`${idPrefix}-note`}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contexto adicional…"
            style={inputStyle}
          />
        </label>

        {submitError ? (
          <ApiErrorDisplay error={submitError} title="Erro ao registar decisão" />
        ) : null}

        <button
          type="submit"
          disabled={submitting || !rationale.trim()}
          style={{
            padding: "0.45rem 1rem",
            background: submitting || !rationale.trim() ? "#94a3b8" : decision === "operar" ? "#166534" : "#92400e",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: submitting || !rationale.trim() ? "not-allowed" : "pointer",
          }}
          aria-busy={submitting}
        >
          {submitting ? "A registar…" : `Registar: ${decision === "operar" ? "Operar" : "Não operar"}`}
        </button>
      </form>

      {lastDecision ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: "0.75rem",
            padding: "0.5rem 0.75rem",
            background: "#dcfce7",
            border: "1px solid #86efac",
            borderRadius: 6,
            fontSize: "0.8rem",
            color: "#166534",
          }}
        >
          <strong>Decisão registada</strong>
          <div style={{ marginTop: 4 }}>
            {lastDecision.decision === "operar" ? "Operar" : "Não operar"} · {lastDecision.symbolInternal}
          </div>
          <div style={{ color: "#64748b", fontSize: "0.72rem", marginTop: 2 }}>ID: {lastDecision.id}</div>
        </div>
      ) : null}
    </section>
  );
}
