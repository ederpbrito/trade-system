/**
 * Utilitários de validação de query params comuns.
 */

const MAX_LIMIT = 500;

/**
 * Converte e valida um parâmetro `limit` de query string.
 * Devolve o valor sanitizado ou `undefined` se ausente.
 * Lança erro com code se o valor for inválido.
 */
export function parseLimit(raw: string | undefined, defaultValue?: number): number | undefined {
  if (raw == null) return defaultValue;
  const n = parseInt(raw, 10);
  if (!Number.isInteger(n) || n < 1) {
    const err = Object.assign(new Error("O parâmetro 'limit' deve ser um inteiro positivo."), {
      code: "INVALID_QUERY_PARAM",
      param: "limit",
    });
    throw err;
  }
  return Math.min(n, MAX_LIMIT);
}

/**
 * Converte e valida um parâmetro `offset` de query string.
 * Devolve o valor sanitizado ou `undefined` se ausente.
 */
export function parseOffset(raw: string | undefined, defaultValue?: number): number | undefined {
  if (raw == null) return defaultValue;
  const n = parseInt(raw, 10);
  if (!Number.isInteger(n) || n < 0) {
    const err = Object.assign(new Error("O parâmetro 'offset' deve ser um inteiro não negativo."), {
      code: "INVALID_QUERY_PARAM",
      param: "offset",
    });
    throw err;
  }
  return n;
}

/**
 * Valida uma string de data ISO.
 * Devolve a string se válida, ou lança erro.
 */
export function parseDateParam(raw: string | undefined, paramName: string): string | undefined {
  if (raw == null) return undefined;
  const d = new Date(raw);
  if (isNaN(d.getTime())) {
    const err = Object.assign(new Error(`O parâmetro '${paramName}' não é uma data válida.`), {
      code: "INVALID_QUERY_PARAM",
      param: paramName,
    });
    throw err;
  }
  return raw;
}
