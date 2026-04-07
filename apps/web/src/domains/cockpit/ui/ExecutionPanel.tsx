/**
 * ExecutionPanel — FR17, FR18, FR19, UX-DR6.
 * Painel de execução em modo demo com badge persistente.
 * Integra formulário de intenção e distinção visual demo vs produção.
 */
import { useCallback, useEffect, useId, useState } from "react";
import { apiFetch } from "../../../shared/http/api-client";
import { UncertaintyDisclaimer } from "../../../shared/ui/UncertaintyDisclaimer";
import { ApiErrorDisplay } from "../../../shared/ui/ApiErrorDisplay";
import type { ApiError } from "../../../shared/ui/ApiErrorDisplay";

type TradingMode = "demo" | "production";

type OrderIntent = {
  id: string;
  symbolInternal: string;
  side: string;
  quantity: number;
  price: number | null;
  mode: TradingMode;
  status: string;
  timeframe: string | null;
  horizonte: string | null;
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
  /** Callback após intenção submetida com sucesso */
  onIntentSubmitted?: (intent: OrderIntent) => void;
};

const demoBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "0.4rem 0.75rem",
  borderRadius: 6,
  background: "#fef9c3",
  border: "1px solid #fde047",
  marginBottom: "0.75rem",
};

const demoBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "0.2rem 0.6rem",
  borderRadius: 999,
  background: "#fbbf24",
  color: "#78350f",
  fontWeight: 700,
  fontSize: "0.75rem",
  letterSpacing: "0.05em",
};

const prodBlockedStyle: React.CSSProperties = {
  padding: "0.75rem",
  borderRadius: 6,
  background: "#fee2e2",
  border: "1px solid #fca5a5",
  color: "#991b1b",
  fontSize: "0.875rem",
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
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

export function ExecutionPanel({ decisionContext, onIntentSubmitted }: Props) {
  const idPrefix = useId();

  const [mode, setMode] = useState<TradingMode | null>(null);
  const [loadingMode, setLoadingMode] = useState(true);
  const [loadModeError, setLoadModeError] = useState<string | null>(null);

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [lastIntent, setLastIntent] = useState<OrderIntent | null>(null);

  const loadMode = useCallback(async () => {
    setLoadingMode(true);
    setLoadModeError(null);
    try {
      const res = await apiFetch("/api/v1/execution/mode");
      if (res.ok) {
        const data = (await res.json()) as { mode: TradingMode };
        setMode(data.mode);
      } else {
        setLoadModeError("Não foi possível obter o modo de execução.");
      }
    } catch {
      setLoadModeError("Erro de rede ao obter o modo de execução.");
    } finally {
      setLoadingMode(false);
    }
  }, []);

  useEffect(() => {
    void loadMode();
  }, [loadMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionContext) return;

    const qty = parseFloat(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setSubmitError({ message: "Quantidade deve ser um número positivo." });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setLastIntent(null);

    try {
      const body: Record<string, unknown> = {
        instrumentId: decisionContext.instrumentId,
        symbolInternal: decisionContext.symbolInternal,
        side,
        quantity: qty,
        timeframe: decisionContext.timeframe,
        horizonte: decisionContext.horizonte,
        candidateId: decisionContext.candidateId,
      };
      if (price.trim()) {
        const parsedPrice = parseFloat(price);
        if (!Number.isFinite(parsedPrice)) {
          setSubmitError({ message: "O preço introduzido não é um número válido." });
          setSubmitting(false);
          return;
        }
        body.price = parsedPrice;
      }
      if (idempotencyKey.trim()) body.idempotencyKey = idempotencyKey.trim();

      const res = await apiFetch("/api/v1/execution/intent", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as { intent?: OrderIntent; error?: ApiError & { pendingCriteria?: string[] } };

      if (!res.ok) {
        const err = data.error ?? { message: "Falha ao submeter intenção." };
        const criteria = data.error?.pendingCriteria;
        setSubmitError({
          ...err,
          message: criteria ? `${err.message ?? ""}\n• ${criteria.join("\n• ")}` : err.message,
        });
        return;
      }

      if (data.intent) {
        setLastIntent(data.intent);
        setQuantity("");
        setPrice("");
        setIdempotencyKey("");
        onIntentSubmitted?.(data.intent);
      }
    } catch {
      setSubmitError({ message: "Erro de rede ao submeter intenção." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMode) {
    return (
      <section aria-label="Execução" style={{ padding: "0.75rem" }}>
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>A carregar modo de execução…</p>
      </section>
    );
  }

  if (loadModeError) {
    return (
      <section aria-label="Execução" style={{ padding: "0.75rem" }}>
        <p role="alert" style={{ color: "#b91c1c", fontSize: "0.875rem" }}>
          {loadModeError}
        </p>
        <button
          type="button"
          onClick={() => void loadMode()}
          style={{ marginTop: "0.5rem", fontSize: "0.75rem", padding: "0.25rem 0.5rem", cursor: "pointer" }}
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  return (
    <section aria-labelledby={`${idPrefix}-exec-title`}>
      <h3 id={`${idPrefix}-exec-title`} style={{ fontSize: "0.95rem", marginBottom: "0.5rem", color: "#0f172a" }}>
        Execução
      </h3>

      {/* UX-DR6: barra de modo sempre visível */}
      <div style={demoBarStyle} role="status" aria-label={`Modo actual: ${mode ?? "desconhecido"}`}>
        {mode === "demo" ? (
          <>
            <span style={demoBadgeStyle} aria-label="Modo demonstração activo">
              DEMO
            </span>
            <span style={{ fontSize: "0.8rem", color: "#92400e" }}>
              Ordens simuladas — sem execução real
            </span>
          </>
        ) : mode === "production" ? (
          <>
            <span
              style={{ ...demoBadgeStyle, background: "#ef4444", color: "#fff" }}
              aria-label="Modo produção activo"
            >
              PRODUÇÃO
            </span>
            <span style={{ fontSize: "0.8rem", color: "#991b1b" }}>
              Execução real activa
            </span>
          </>
        ) : (
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Modo desconhecido</span>
        )}
      </div>

      {/* FR19: gate de produção */}
      {mode === "production" && (
        <div style={prodBlockedStyle} role="alert">
          <strong>Execução em produção bloqueada no MVP.</strong>
          <p style={{ margin: "0.4rem 0 0" }}>
            Critérios pendentes:
          </p>
          <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.2rem" }}>
            <li>Validação manual de configuração de produção</li>
            <li>Aprovação explícita de modo produção</li>
          </ul>
        </div>
      )}

      {/* FR32/UX-DR14: aviso de incerteza sempre visível na área de execução */}
      <div style={{ marginBottom: "0.5rem" }}>
        <UncertaintyDisclaimer variant="compact" />
      </div>

      {/* FR17: formulário de intenção de execução demo */}
      {mode === "demo" && (
        <>
          {!decisionContext ? (
            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0.5rem 0 0" }}>
              Seleccione um candidato para submeter intenção de execução.
            </p>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: "0.8rem", color: "#334155", padding: "0.4rem 0.5rem", background: "#f1f5f9", borderRadius: 4 }}>
                <strong>{decisionContext.symbolInternal}</strong>
                {" · "}
                {decisionContext.timeframe} / {decisionContext.horizonte}
              </div>

              <label style={labelStyle} htmlFor={`${idPrefix}-side`}>
                Lado
                <select
                  id={`${idPrefix}-side`}
                  value={side}
                  onChange={(e) => setSide(e.target.value as "buy" | "sell")}
                  style={inputStyle}
                >
                  <option value="buy">Comprar (buy)</option>
                  <option value="sell">Vender (sell)</option>
                </select>
              </label>

              <label style={labelStyle} htmlFor={`${idPrefix}-qty`}>
                Quantidade (lotes)
                <input
                  id={`${idPrefix}-qty`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="ex: 0.10"
                  style={inputStyle}
                  required
                />
              </label>

              <label style={labelStyle} htmlFor={`${idPrefix}-price`}>
                Preço (opcional — vazio = mercado)
                <input
                  id={`${idPrefix}-price`}
                  type="number"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="ex: 1.08500"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle} htmlFor={`${idPrefix}-idem`}>
                Chave de idempotência (opcional)
                <input
                  id={`${idPrefix}-idem`}
                  type="text"
                  value={idempotencyKey}
                  onChange={(e) => setIdempotencyKey(e.target.value)}
                  placeholder="ex: minha-ordem-001"
                  style={inputStyle}
                />
              </label>

              {submitError ? (
                <ApiErrorDisplay error={submitError} title="Erro ao submeter intenção" />
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "0.45rem 1rem",
                  background: submitting ? "#94a3b8" : "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
                aria-busy={submitting}
              >
                {submitting ? "A submeter…" : "Submeter intenção demo"}
              </button>
            </form>
          )}

          {lastIntent ? (
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
              <strong>Intenção registada</strong>
              <div style={{ marginTop: 4 }}>
                {lastIntent.side.toUpperCase()} {lastIntent.quantity} {lastIntent.symbolInternal} ·{" "}
                <span style={{ fontWeight: 600 }}>DEMO</span> · {lastIntent.status}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.72rem", marginTop: 2 }}>ID: {lastIntent.id}</div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
