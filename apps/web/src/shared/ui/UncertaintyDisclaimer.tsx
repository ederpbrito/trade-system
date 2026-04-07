/**
 * UncertaintyDisclaimer — FR32, UX-DR14.
 * Aviso explícito de incerteza e ausência de garantia de resultado financeiro.
 * Deve aparecer nos fluxos de análise, execução e assistente.
 * Contraste WCAG AA: texto escuro sobre fundo âmbar claro (UX-DR13).
 */
import type { CSSProperties } from "react";

type Variant = "banner" | "inline" | "compact";

type Props = {
  variant?: Variant;
  /** Contexto adicional opcional (ex.: nome do instrumento) */
  context?: string;
};

const bannerStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  padding: "0.6rem 0.75rem",
  background: "#fffbeb",
  border: "1px solid #fde68a",
  borderRadius: 6,
  fontSize: "0.8rem",
  color: "#78350f",
  lineHeight: 1.4,
};

const inlineStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 6,
  padding: "0.4rem 0.6rem",
  background: "#fef9c3",
  borderLeft: "3px solid #f59e0b",
  borderRadius: "0 4px 4px 0",
  fontSize: "0.75rem",
  color: "#78350f",
  lineHeight: 1.4,
};

const compactStyle: CSSProperties = {
  fontSize: "0.68rem",
  color: "#92400e",
  padding: "0.2rem 0",
  lineHeight: 1.3,
};

const iconStyle: CSSProperties = {
  flexShrink: 0,
  fontSize: "0.9rem",
  marginTop: 1,
};

const DISCLAIMER_TEXT =
  "Este sistema é uma ferramenta de apoio à decisão. Sinais, análises e sugestões não constituem garantia de resultado financeiro. Toda a decisão de operar é da exclusiva responsabilidade do utilizador.";

const COMPACT_TEXT = "Sem garantia de resultado financeiro. Decisão é da responsabilidade do utilizador.";

export function UncertaintyDisclaimer({ variant = "inline", context }: Props) {
  if (variant === "compact") {
    return (
      <p role="note" aria-label="Aviso de incerteza" style={compactStyle}>
        ⚠ {COMPACT_TEXT}
        {context ? ` (${context})` : ""}
      </p>
    );
  }

  const style = variant === "banner" ? bannerStyle : inlineStyle;

  return (
    <div role="note" aria-label="Aviso de incerteza e ausência de garantia" style={style}>
      <span style={iconStyle} aria-hidden="true">
        ⚠
      </span>
      <div>
        <strong style={{ display: "block", marginBottom: 2 }}>Aviso importante</strong>
        {DISCLAIMER_TEXT}
        {context ? (
          <span style={{ display: "block", marginTop: 4, fontStyle: "italic" }}>
            Contexto: {context}
          </span>
        ) : null}
      </div>
    </div>
  );
}
