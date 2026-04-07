/**
 * useApiError — utilitário para extrair e gerir erros de API.
 * FR36/UX-DR12: extrai requestId da resposta de erro para exibição copiável.
 */
import { useState } from "react";
import type { ApiError } from "../ui/ApiErrorDisplay";

export function useApiError() {
  const [apiError, setApiError] = useState<ApiError | null>(null);

  const clearError = () => setApiError(null);

  /**
   * Extrai o erro de uma resposta de API não-ok.
   * Espera o formato: { error: { code, message, requestId } }
   */
  const extractError = async (res: Response): Promise<ApiError> => {
    try {
      const body = (await res.json()) as { error?: ApiError };
      return body.error ?? { code: "UNKNOWN_ERROR", message: `Erro HTTP ${res.status}` };
    } catch {
      return { code: "PARSE_ERROR", message: `Erro HTTP ${res.status}` };
    }
  };

  const handleResponse = async (res: Response): Promise<boolean> => {
    if (res.ok) {
      setApiError(null);
      return true;
    }
    const err = await extractError(res);
    setApiError(err);
    return false;
  };

  return { apiError, setApiError, clearError, handleResponse, extractError };
}
