/**
 * RiskPanel — FR13, FR14, FR15, FR16 (Épico 4)
 * Painel de gestão de risco no cockpit:
 *  - Formulário de limites (4.1)
 *  - Pré-visualização de aderência (4.2)
 *  - Confirmação de exceção com motivo (4.3)
 */
import { useCallback, useEffect, useId, useState } from "react";
import { apiFetch } from "../../../shared/http/api-client";

type RiskLimits = {
  maxPositionSize: number | null;
  maxDailyLoss: number | null;
  maxConcentration: number | null;
  maxTotalExposure: number | null;
  updatedAt: string;
};

type LimitViolation = {
  limitKey: string;
  proposedValue: number;
  limitValue: number;
  label: string;
};

type RiskMetricsSnapshot = {
  positionSize?: number;
  price?: number;
  currentDailyLoss?: number;
  concentration?: number;
  totalExposure?: number;
};

type AdherenceResult = {
  ok: boolean;
  violations: LimitViolation[];
  before: RiskMetricsSnapshot;
  after: RiskMetricsSnapshot;
};

type Props = {
  /** Contexto de decisão activo (candidato seleccionado) */
  decisionContext?: {
    candidateId: string;
    symbolInternal: string;
    timeframe: string;
    horizonte: string;
  } | null;
  /**
   * Callback invocado quando o utilizador pode prosseguir (4.3):
   * após verificação limpa ou após registar exceção para todas as violações.
   */
  onProceed?: () => void;
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  flex: "1 1 140px",
  minWidth: 120,
};

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
};

const errorStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#b91c1c",
  marginTop: 2,
};

function parseOptionalNumber(val: string): number | null {
  if (val.trim() === "") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

export function RiskPanel({ decisionContext, onProceed }: Props) {
  const idPrefix = useId();

  const [limits, setLimits] = useState<RiskLimits | null>(null);
  const [loadingLimits, setLoadingLimits] = useState(false);
  const [limitsError, setLimitsError] = useState<string | null>(null);

  /* Form state para limites configurados */
  const [limitPosSize, setLimitPosSize] = useState("");
  const [limitDailyLoss, setLimitDailyLoss] = useState("");
  const [limitConcentration, setLimitConcentration] = useState("");
  const [limitTotalExposure, setLimitTotalExposure] = useState("");
  const [savingLimits, setSavingLimits] = useState(false);
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /* Form state para proposta de aderência (valores da operação a simular) */
  const [propPosSize, setPropPosSize] = useState("");
  const [propPrice, setPropPrice] = useState("");
  const [propDailyLoss, setPropDailyLoss] = useState("");
  const [propConcentration, setPropConcentration] = useState("");
  const [propTotalExposure, setPropTotalExposure] = useState("");

  /* Aderência */
  const [adherenceResult, setAdherenceResult] = useState<AdherenceResult | null>(null);
  const [checkingAdherence, setCheckingAdherence] = useState(false);
  const [adherenceError, setAdherenceError] = useState<string | null>(null);

  /* Exceção */
  const [showException, setShowException] = useState(false);
  const [exceptionReason, setExceptionReason] = useState("");
  const [submittingException, setSubmittingException] = useState(false);
  const [exceptionError, setExceptionError] = useState<string | null>(null);
  const [exceptionSuccess, setExceptionSuccess] = useState(false);
  const [pendingViolation, setPendingViolation] = useState<LimitViolation | null>(null);
  /** Chaves de limite para as quais já foi registada exceção nesta sessão de verificação. */
  const [resolvedViolationKeys, setResolvedViolationKeys] = useState<Set<string>>(new Set());

  const loadLimits = useCallback(async () => {
    setLoadingLimits(true);
    setLimitsError(null);
    try {
      const res = await apiFetch("/api/v1/risk/limits");
      if (!res.ok) {
        setLimitsError("Não foi possível carregar os limites.");
        return;
      }
      const data = (await res.json()) as { limits: RiskLimits | null };
      setLimits(data.limits);
      if (data.limits) {
        setLimitPosSize(data.limits.maxPositionSize?.toString() ?? "");
        setLimitDailyLoss(data.limits.maxDailyLoss?.toString() ?? "");
        setLimitConcentration(data.limits.maxConcentration?.toString() ?? "");
        setLimitTotalExposure(data.limits.maxTotalExposure?.toString() ?? "");
      }
    } finally {
      setLoadingLimits(false);
    }
  }, []);

  useEffect(() => {
    void loadLimits();
  }, [loadLimits]);

  const saveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLimits(true);
    setSaveErrors([]);
    setSaveSuccess(false);
    try {
      const res = await apiFetch("/api/v1/risk/limits", {
        method: "PUT",
        body: JSON.stringify({
          maxPositionSize: parseOptionalNumber(limitPosSize),
          maxDailyLoss: parseOptionalNumber(limitDailyLoss),
          maxConcentration: parseOptionalNumber(limitConcentration),
          maxTotalExposure: parseOptionalNumber(limitTotalExposure),
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: { errors?: string[]; message?: string } } | null;
        setSaveErrors(j?.error?.errors ?? [j?.error?.message ?? "Erro ao guardar."]);
        return;
      }
      const data = (await res.json()) as { limits: RiskLimits };
      setLimits(data.limits);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSavingLimits(false);
    }
  };

  const checkAdherence = async () => {
    setCheckingAdherence(true);
    setAdherenceError(null);
    setAdherenceResult(null);
    setShowException(false);
    setResolvedViolationKeys(new Set());
    try {
      const res = await apiFetch("/api/v1/risk/check", {
        method: "POST",
        body: JSON.stringify({
          positionSize: parseOptionalNumber(propPosSize) ?? undefined,
          price: parseOptionalNumber(propPrice) ?? undefined,
          currentDailyLoss: parseOptionalNumber(propDailyLoss) ?? undefined,
          concentration: parseOptionalNumber(propConcentration) ?? undefined,
          totalExposure: parseOptionalNumber(propTotalExposure) ?? undefined,
        }),
      });
      if (!res.ok) {
        setAdherenceError("Não foi possível verificar aderência.");
        return;
      }
      const data = (await res.json()) as { result: AdherenceResult };
      setAdherenceResult(data.result);
    } finally {
      setCheckingAdherence(false);
    }
  };

  const openException = (violation: LimitViolation) => {
    setPendingViolation(violation);
    setExceptionReason("");
    setExceptionError(null);
    setExceptionSuccess(false);
    setShowException(true);
  };

  const submitException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingViolation) return;
    setSubmittingException(true);
    setExceptionError(null);
    try {
      const res = await apiFetch("/api/v1/risk/exception", {
        method: "POST",
        body: JSON.stringify({
          limitKey: pendingViolation.limitKey,
          proposedValue: pendingViolation.proposedValue,
          limitValue: pendingViolation.limitValue,
          reason: exceptionReason,
          contextJson: decisionContext ? JSON.stringify(decisionContext) : undefined,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setExceptionError(j?.error?.message ?? "Erro ao registar exceção.");
        return;
      }
      setExceptionSuccess(true);
      setShowException(false);
      setResolvedViolationKeys((prev) => new Set([...prev, pendingViolation.limitKey]));
      setPendingViolation(null);
    } finally {
      setSubmittingException(false);
    }
  };

  return (
    <section aria-labelledby={`${idPrefix}-risk-title`} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "1rem", background: "#fff" }}>
      <h2 id={`${idPrefix}-risk-title`} style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
        Limites de risco
      </h2>

      {loadingLimits ? (
        <p style={{ fontSize: "0.875rem", color: "#64748b" }}>A carregar…</p>
      ) : limitsError ? (
        <p role="alert" style={{ fontSize: "0.875rem", color: "#b91c1c" }}>
          {limitsError}
        </p>
      ) : (
        <>
          {/* 4.1 — Formulário de limites (UX-DR13: labels acessíveis, erros associados) */}
          <form onSubmit={(e) => void saveLimits(e)} noValidate aria-label="Formulário de limites de risco">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: "0.75rem" }}>
              <div style={fieldStyle}>
                <label htmlFor={`${idPrefix}-lim-pos-size`} style={labelStyle}>
                  Tamanho máx. posição
                </label>
                <input
                  id={`${idPrefix}-lim-pos-size`}
                  type="number"
                  min="0"
                  step="any"
                  value={limitPosSize}
                  onChange={(e) => setLimitPosSize(e.target.value)}
                  placeholder="ex.: 10"
                  style={inputStyle}
                  aria-describedby={saveErrors.length > 0 ? `${idPrefix}-save-errors` : undefined}
                  aria-invalid={saveErrors.length > 0 ? "true" : undefined}
                />
              </div>
              <div style={fieldStyle}>
                <label htmlFor={`${idPrefix}-lim-daily-loss`} style={labelStyle}>
                  Perda diária máx.
                </label>
                <input
                  id={`${idPrefix}-lim-daily-loss`}
                  type="number"
                  min="0"
                  step="any"
                  value={limitDailyLoss}
                  onChange={(e) => setLimitDailyLoss(e.target.value)}
                  placeholder="ex.: 500"
                  style={inputStyle}
                  aria-describedby={saveErrors.length > 0 ? `${idPrefix}-save-errors` : undefined}
                  aria-invalid={saveErrors.length > 0 ? "true" : undefined}
                />
              </div>
              <div style={fieldStyle}>
                <label htmlFor={`${idPrefix}-lim-concentration`} style={labelStyle}>
                  Concentração máx. (0–1)
                </label>
                <input
                  id={`${idPrefix}-lim-concentration`}
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={limitConcentration}
                  onChange={(e) => setLimitConcentration(e.target.value)}
                  placeholder="ex.: 0.20"
                  style={inputStyle}
                  aria-describedby={saveErrors.length > 0 ? `${idPrefix}-save-errors` : undefined}
                  aria-invalid={saveErrors.length > 0 ? "true" : undefined}
                />
              </div>
              <div style={fieldStyle}>
                <label htmlFor={`${idPrefix}-lim-total-exposure`} style={labelStyle}>
                  Exposição total máx.
                </label>
                <input
                  id={`${idPrefix}-lim-total-exposure`}
                  type="number"
                  min="0"
                  step="any"
                  value={limitTotalExposure}
                  onChange={(e) => setLimitTotalExposure(e.target.value)}
                  placeholder="ex.: 5000"
                  style={inputStyle}
                  aria-describedby={saveErrors.length > 0 ? `${idPrefix}-save-errors` : undefined}
                  aria-invalid={saveErrors.length > 0 ? "true" : undefined}
                />
              </div>
            </div>

            {saveErrors.length > 0 && (
              <ul id={`${idPrefix}-save-errors`} role="alert" style={{ margin: "0 0 0.5rem", paddingLeft: "1.2rem" }}>
                {saveErrors.map((err, i) => (
                  <li key={i} style={errorStyle}>
                    {err}
                  </li>
                ))}
              </ul>
            )}

            {saveSuccess && (
              <p role="status" style={{ fontSize: "0.75rem", color: "#166534", marginBottom: "0.5rem" }}>
                ✓ Limites guardados.
              </p>
            )}

            <button
              type="submit"
              disabled={savingLimits}
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.875rem", cursor: savingLimits ? "wait" : "pointer" }}
              aria-busy={savingLimits}
            >
              {savingLimits ? "A guardar…" : "Guardar limites"}
            </button>
          </form>

          {/* 4.2 — Proposta de operação para verificação de aderência pré-decisão */}
          <fieldset
            style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "0.75rem", marginTop: "0.75rem" }}
            aria-label="Proposta de operação"
          >
            <legend style={{ ...labelStyle, padding: "0 0.25rem", fontSize: "0.8rem" }}>
              Proposta de operação (verificar aderência)
            </legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: "0.6rem" }}>
              <div style={fieldStyle}>
                <label htmlFor={`${idPrefix}-prop-pos-size`} style={labelStyle}>
                  Tamanho posição
                </label>
                <input
                  id={`${idPrefix}-prop-pos-size`}
                  type="number"
                  min="0"
                  step="any"
                  value={propPosSize}
                  onChange={(e) => setPropPosSize(e.target.value)}
                  placeholder="ex.: 5"
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label htmlFor={`${idPrefix}-prop-price`} style={labelStyle}>
                  Preço de entrada
                </label>
                <input
                  id={`${idPrefix}-prop-price`}
                  type="number"
                  min="0"
                  step="any"
                  value={propPrice}
                  onChange={(e) => setPropPrice(e.target.value)}
                  placeholder="ex.: 1.2345"
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label htmlFor={`${idPrefix}-prop-daily-loss`} style={labelStyle}>
                  Perda diária acumulada
                </label>
                <input
                  id={`${idPrefix}-prop-daily-loss`}
                  type="number"
                  min="0"
                  step="any"
                  value={propDailyLoss}
                  onChange={(e) => setPropDailyLoss(e.target.value)}
                  placeholder="ex.: 200"
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label htmlFor={`${idPrefix}-prop-concentration`} style={labelStyle}>
                  Concentração (0–1)
                </label>
                <input
                  id={`${idPrefix}-prop-concentration`}
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={propConcentration}
                  onChange={(e) => setPropConcentration(e.target.value)}
                  placeholder="ex.: 0.15"
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label htmlFor={`${idPrefix}-prop-total-exposure`} style={labelStyle}>
                  Exposição total
                </label>
                <input
                  id={`${idPrefix}-prop-total-exposure`}
                  type="number"
                  min="0"
                  step="any"
                  value={propTotalExposure}
                  onChange={(e) => setPropTotalExposure(e.target.value)}
                  placeholder="ex.: 2000"
                  style={inputStyle}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => void checkAdherence()}
              disabled={checkingAdherence}
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.875rem", cursor: checkingAdherence ? "wait" : "pointer", background: "#e0e7ff", border: "1px solid #a5b4fc", borderRadius: 4 }}
              aria-busy={checkingAdherence}
            >
              {checkingAdherence ? "A verificar…" : "Verificar aderência"}
            </button>
          </fieldset>

          {/* 4.2 — Resultado de aderência */}
          {adherenceError && (
            <p role="alert" style={{ fontSize: "0.8rem", color: "#b91c1c", marginTop: "0.5rem" }}>
              {adherenceError}
            </p>
          )}

          {adherenceResult && (() => {
            const unresolvedViolations = adherenceResult.violations.filter(
              (v) => !resolvedViolationKeys.has(v.limitKey),
            );
            const allViolationsResolved =
              adherenceResult.violations.length > 0 && unresolvedViolations.length === 0;
            const canProceed = adherenceResult.ok || allViolationsResolved;

            return (
              <div
                role="region"
                aria-label="Resultado de aderência"
                style={{
                  marginTop: "0.75rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: 6,
                  background: adherenceResult.ok ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${adherenceResult.ok ? "#86efac" : "#fca5a5"}`,
                }}
              >
                <p style={{ fontWeight: 700, fontSize: "0.875rem", color: adherenceResult.ok ? "#166534" : "#991b1b", margin: "0 0 0.4rem" }}>
                  {adherenceResult.ok ? "✓ Dentro dos limites" : "✗ Violação detectada"}
                </p>

                {adherenceResult.violations.length > 0 && (
                  <ul style={{ margin: "0 0 0.5rem", paddingLeft: "1.1rem", fontSize: "0.8rem", color: "#7f1d1d" }}>
                    {adherenceResult.violations.map((v) => {
                      const resolved = resolvedViolationKeys.has(v.limitKey);
                      return (
                        <li key={v.limitKey} style={{ marginBottom: 4 }}>
                          <strong>{v.label}</strong>: proposto {v.proposedValue} &gt; limite {v.limitValue}
                          {resolved ? (
                            <span style={{ marginLeft: 8, fontSize: "0.72rem", color: "#166534", fontWeight: 600 }}>
                              ✓ exceção registada
                            </span>
                          ) : (
                            /* 4.3 — Bloqueio: o utilizador DEVE registar exceção para cada violação antes de prosseguir */
                            <button
                              type="button"
                              onClick={() => openException(v)}
                              style={{ marginLeft: 8, fontSize: "0.72rem", padding: "0.1rem 0.4rem", cursor: "pointer", background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 4 }}
                            >
                              Registar exceção (obrigatório)
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* FR16 — estado antes/depois da simulação */}
                <details style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#475569" }}>
                  <summary style={{ cursor: "pointer" }}>Estado antes / depois da operação (FR16)</summary>
                  <pre style={{ margin: "0.3rem 0 0", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    {JSON.stringify({ antes: adherenceResult.before, depois: adherenceResult.after }, null, 2)}
                  </pre>
                </details>

                {/* 4.3 — Botão de prosseguimento: bloqueado até todas as violações terem exceção registada */}
                {onProceed && (
                  <div style={{ marginTop: "0.6rem" }}>
                    {!canProceed && unresolvedViolations.length > 0 && (
                      <p role="alert" style={{ fontSize: "0.75rem", color: "#991b1b", margin: "0 0 0.4rem" }}>
                        Registe exceção para {unresolvedViolations.length === 1 ? "a violação acima" : `as ${unresolvedViolations.length} violações acima`} antes de prosseguir.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={onProceed}
                      disabled={!canProceed}
                      style={{
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.875rem",
                        cursor: canProceed ? "pointer" : "not-allowed",
                        background: canProceed ? "#166534" : "#94a3b8",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        opacity: canProceed ? 1 : 0.6,
                      }}
                      aria-disabled={!canProceed}
                    >
                      Prosseguir
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {exceptionSuccess && (
            <p role="status" style={{ fontSize: "0.75rem", color: "#166534", marginTop: "0.5rem" }}>
              ✓ Exceção registada na trilha auditável.
            </p>
          )}

          {/* 4.3 — Formulário de confirmação de exceção */}
          {showException && pendingViolation && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${idPrefix}-exc-title`}
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem",
                border: "2px solid #f97316",
                borderRadius: 6,
                background: "#fff7ed",
              }}
            >
              <h3 id={`${idPrefix}-exc-title`} style={{ fontSize: "0.875rem", margin: "0 0 0.5rem", color: "#9a3412" }}>
                Confirmar exceção: {pendingViolation.label}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#7c2d12", margin: "0 0 0.5rem" }}>
                Proposto: <strong>{pendingViolation.proposedValue}</strong> · Limite: <strong>{pendingViolation.limitValue}</strong>
              </p>
              <form onSubmit={(e) => void submitException(e)} aria-label="Formulário de exceção de risco">
                <div style={{ marginBottom: "0.5rem" }}>
                  <label htmlFor={`${idPrefix}-exc-reason`} style={{ ...labelStyle, display: "block", marginBottom: 4 }}>
                    Motivo de exceção <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id={`${idPrefix}-exc-reason`}
                    value={exceptionReason}
                    onChange={(e) => setExceptionReason(e.target.value)}
                    required
                    rows={3}
                    placeholder="Descreva o motivo para esta exceção…"
                    style={{ ...inputStyle, resize: "vertical" }}
                    aria-required="true"
                  />
                </div>
                {exceptionError && (
                  <p role="alert" style={errorStyle}>
                    {exceptionError}
                  </p>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="submit"
                    disabled={submittingException || !exceptionReason.trim()}
                    style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem", cursor: "pointer", background: "#f97316", color: "#fff", border: "none", borderRadius: 4 }}
                    aria-busy={submittingException}
                  >
                    {submittingException ? "A registar…" : "Confirmar e registar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowException(false)}
                    style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem", cursor: "pointer", background: "none", border: "1px solid #cbd5e1", borderRadius: 4 }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {limits && (
            <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.5rem" }}>
              Última actualização: {new Date(limits.updatedAt).toLocaleString("pt-PT")}
            </p>
          )}
        </>
      )}
    </section>
  );
}
