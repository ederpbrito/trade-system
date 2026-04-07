/**
 * ApiErrorDisplay — FR36, UX-DR12.
 * Componente de exibição de erros de API com requestId copiável.
 * Usado em qualquer lugar onde um erro de API deva ser apresentado ao utilizador.
 */
import { useEffect, useRef, useState } from "react";

export type ApiError = {
  code?: string;
  message?: string;
  requestId?: string;
};

type Props = {
  error: ApiError | null;
  /** Título opcional para o bloco de erro */
  title?: string;
  /** Estilo de apresentação */
  variant?: "inline" | "toast";
};

const containerStyle: React.CSSProperties = {
  padding: "0.6rem 0.75rem",
  background: "#fef2f2",
  border: "1px solid #fca5a5",
  borderRadius: 6,
  fontSize: "0.8rem",
  color: "#991b1b",
};

const requestIdRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginTop: 6,
  padding: "0.3rem 0.5rem",
  background: "#fff1f2",
  borderRadius: 4,
  border: "1px solid #fecaca",
};

const codeStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "0.72rem",
  color: "#7f1d1d",
  flex: 1,
  wordBreak: "break-all",
};

const copyBtnStyle = (copied: boolean): React.CSSProperties => ({
  padding: "0.15rem 0.5rem",
  fontSize: "0.68rem",
  border: "1px solid",
  borderColor: copied ? "#86efac" : "#fca5a5",
  borderRadius: 4,
  background: copied ? "#dcfce7" : "#fff",
  color: copied ? "#166534" : "#991b1b",
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
});

export function ApiErrorDisplay({ error, title = "Erro", variant = "inline" }: Props) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup do timer ao desmontar (P11)
  useEffect(() => {
    return () => {
      if (timerRef.current != null) clearTimeout(timerRef.current);
    };
  }, []);

  if (!error) return null;

  const scheduleCopiedReset = () => {
    if (timerRef.current != null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleCopy = async () => {
    if (!error.requestId) return;
    try {
      await navigator.clipboard.writeText(error.requestId);
      setCopied(true);
      scheduleCopiedReset();
    } catch {
      // Fallback para browsers sem clipboard API (P10: verificar retorno)
      const el = document.createElement("textarea");
      el.value = error.requestId;
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      if (ok) {
        setCopied(true);
        scheduleCopiedReset();
      }
    }
  };

  return (
    <div
      role="alert"
      style={containerStyle}
      data-variant={variant}
    >
      <strong style={{ display: "block", marginBottom: 2 }}>{title}</strong>
      {error.message ? <p style={{ margin: 0 }}>{error.message}</p> : null}
      {error.code ? (
        <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: "#b91c1c" }}>
          Código: <code>{error.code}</code>
        </p>
      ) : null}

      {/* FR36/UX-DR12: requestId copiável */}
      {error.requestId ? (
        <div style={requestIdRowStyle}>
          <span style={{ fontSize: "0.68rem", color: "#7f1d1d", flexShrink: 0 }}>
            requestId:
          </span>
          <code style={codeStyle} aria-label={`Request ID: ${error.requestId}`}>
            {error.requestId}
          </code>
          <button
            type="button"
            onClick={() => void handleCopy()}
            style={copyBtnStyle(copied)}
            aria-label={copied ? "Copiado!" : "Copiar requestId para diagnóstico"}
            title="Copiar requestId para diagnóstico (FR36)"
          >
            {copied ? "✓ Copiado" : "Copiar"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
