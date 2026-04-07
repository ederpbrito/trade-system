/**
 * AssistantService — fachada de regras/templates para o assistente de decisão contextual.
 * FR9–FR11. ADR-002: esta classe é a fachada que poderá ser substituída por LLM/MCP no futuro.
 *
 * Implementação actual: baseada em regras e templates determinísticos.
 * Não inventa dados de risco — recebe contexto de risco da API (FR11 AC).
 */
import {
  ASSISTANT_SCHEMA_VERSION,
  type AssistantRiskContext,
  type AssistantThesisRequest,
  type AssistantThesisResponse,
  type ConflictSeverity,
  type RiskRelation,
  type ThesisSection,
  type WindowConflict,
} from "./ports.js";

/** Mapeamento de timeframe para descrição legível. */
const TIMEFRAME_LABEL: Record<string, string> = {
  M15: "15 minutos",
  H1: "1 hora",
  H4: "4 horas",
  D1: "diário",
};

/** Mapeamento de horizonte para descrição legível. */
const HORIZONTE_LABEL: Record<string, string> = {
  dia: "intraday",
  semana: "semanal",
  mes: "mensal",
};

function tfLabel(tf: string): string {
  return TIMEFRAME_LABEL[tf] ?? tf;
}

function hLabel(h: string): string {
  return HORIZONTE_LABEL[h] ?? h;
}

/**
 * Gera secções estruturadas da tese com base em regras/templates (FR9).
 * Secções estáveis: resumo, fatores, incerteza.
 */
function buildSections(req: AssistantThesisRequest): ThesisSection[] {
  const { symbolInternal, timeframe, horizonte } = req;
  const tf = tfLabel(timeframe);
  const h = hLabel(horizonte);

  return [
    {
      id: "resumo",
      title: "Resumo da tese",
      content:
        `Análise de ${symbolInternal} no timeframe ${tf} com horizonte ${h}. ` +
        `A janela seleccionada sugere uma oportunidade candidata identificada pelo motor de análise. ` +
        `Reveja os fatores abaixo antes de tomar qualquer decisão.`,
    },
    {
      id: "fatores",
      title: "Fatores relevantes",
      content:
        `Timeframe: ${tf}. Horizonte: ${h}. ` +
        `O ativo ${symbolInternal} encontra-se na lista monitorizada. ` +
        `A candidatura foi gerada com base na política de degradação activa e nos dados de mercado disponíveis. ` +
        `Verifique o estado das fontes antes de agir.`,
    },
    {
      id: "incerteza",
      title: "Incerteza e limitações",
      content:
        `Esta análise é gerada por regras determinísticas e não constitui aconselhamento financeiro. ` +
        `A qualidade dos dados depende das fontes activas. ` +
        `Em caso de fonte degradada ou indisponível, a análise pode não reflectir condições actuais de mercado.`,
    },
  ];
}

/**
 * Detecta conflito entre janelas de curto e longo prazo (FR10, UX-DR5).
 * Conflito existe quando o timeframe de análise é curto (M15) mas o horizonte de detenção
 * é longo (semana/mes), criando divergência entre a janela de entrada e o horizonte de saída.
 * Extensível para lógica mais sofisticada ou LLM no futuro.
 */
function buildConflict(req: AssistantThesisRequest): WindowConflict {
  const { symbolInternal, timeframe, horizonte } = req;

  // Conflito real: timeframe curto com horizonte longo (ex: M15/semana — entrada rápida, saída lenta)
  const isShortTimeframe = timeframe === "M15";
  const isLongHorizonte = horizonte === "semana" || horizonte === "mes";
  const hasConflict = isShortTimeframe && isLongHorizonte;

  let severity: ConflictSeverity = "none";
  let shortTermNarrative = `Sem sinal de conflito de curto prazo para ${symbolInternal}.`;
  let longTermNarrative = `Sem sinal de conflito de longo prazo para ${symbolInternal}.`;

  if (hasConflict) {
    severity = "low";
    shortTermNarrative =
      `Sinal de curto prazo (${tfLabel(timeframe)}) para ${symbolInternal}: ` +
      `a janela intraday pode apresentar volatilidade acrescida.`;
    longTermNarrative =
      `Contexto de longo prazo (horizonte ${hLabel(horizonte)}) para ${symbolInternal}: ` +
      `a tendência de fundo pode divergir do movimento de curto prazo. Avalie a coerência entre horizontes.`;
  } else if (isShortTimeframe) {
    shortTermNarrative =
      `Sinal de curto prazo (${tfLabel(timeframe)}) para ${symbolInternal}: ` +
      `foco intraday com horizonte ${hLabel(horizonte)} — coerente.`;
  } else {
    longTermNarrative =
      `Contexto de ${tfLabel(timeframe)} com horizonte ${hLabel(horizonte)} para ${symbolInternal}: ` +
      `janela e horizonte alinhados.`;
  }

  return { shortTermNarrative, longTermNarrative, severity };
}

/**
 * Relaciona oportunidade com limites de risco (FR11).
 * Dados vindos da API — não inventados pelo cliente (AC 6-3).
 */
function buildRiskRelation(riskCtx: AssistantRiskContext | null): RiskRelation {
  if (!riskCtx || (riskCtx.maxPositionSize === null && riskCtx.maxDailyLoss === null)) {
    return {
      hasLimits: false,
      adherenceSummary: "Sem limites de risco configurados. Configure limites no painel de risco para obter análise de aderência.",
      headroomPositionSize: null,
      headroomDailyLoss: null,
    };
  }

  const parts: string[] = [];
  let headroomPositionSize: number | null = null;
  let headroomDailyLoss: number | null = null;

  if (riskCtx.maxPositionSize !== null && riskCtx.maxPositionSize !== undefined) {
    const current = riskCtx.currentPositionSize ?? 0;
    headroomPositionSize = Math.max(0, riskCtx.maxPositionSize - current);
    parts.push(
      `Tamanho máximo de posição: ${riskCtx.maxPositionSize} (espaço disponível: ${headroomPositionSize.toFixed(2)}).`,
    );
  }

  if (riskCtx.maxDailyLoss !== null && riskCtx.maxDailyLoss !== undefined) {
    const current = riskCtx.currentDailyLoss ?? 0;
    headroomDailyLoss = Math.max(0, riskCtx.maxDailyLoss - current);
    parts.push(
      `Perda diária máxima: ${riskCtx.maxDailyLoss} (espaço disponível: ${headroomDailyLoss.toFixed(2)}).`,
    );
  }

  const adherenceSummary = parts.length > 0 ? parts.join(" ") : null;

  return {
    hasLimits: true,
    adherenceSummary,
    headroomPositionSize,
    headroomDailyLoss,
  };
}

/**
 * AssistantService — fachada de regras/templates (ADR-002).
 * Ponto de extensão para LLM/MCP no futuro sem alterar a UI.
 */
export class AssistantService {
  /**
   * Gera a tese completa para um candidato e janela seleccionados (FR9–FR11).
   * @param req — contexto do candidato e janela
   * @param riskCtx — contexto de risco do utilizador (pode ser null se não configurado)
   */
  generateThesis(
    req: AssistantThesisRequest,
    riskCtx: AssistantRiskContext | null,
  ): AssistantThesisResponse {
    return {
      schemaVersion: ASSISTANT_SCHEMA_VERSION,
      symbolInternal: req.symbolInternal,
      timeframe: req.timeframe,
      horizonte: req.horizonte,
      sections: buildSections(req),
      conflict: buildConflict(req),
      riskRelation: buildRiskRelation(riskCtx),
      generatedAt: new Date().toISOString(),
    };
  }
}
