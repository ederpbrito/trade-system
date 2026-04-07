/**
 * TradingModeService — FR17, FR18, FR19.
 * Gere o modo de negociação (demo/produção) e submete intenções de execução.
 * Depende de portas (IExecutionConnector, IOrderIntentRepository) — sem Drizzle directo.
 */
import type { IExecutionConnector, IOrderIntentRepository, OrderIntentInput, SubmitIntentResult, TradingMode } from "./ports.js";

export class TradingModeService {
  constructor(
    private readonly connector: IExecutionConnector,
    private readonly orderIntentRepo: IOrderIntentRepository,
  ) {}

  get currentMode(): TradingMode {
    return this.connector.mode;
  }

  /**
   * Submete intenção de execução.
   * FR17: em modo demo, regista e responde sem executar produção.
   * FR19: em modo produção, lança erro se gates não estiverem satisfeitos (a validar externamente).
   * Idempotência: se idempotencyKey já existir (por userId), devolve o registo existente sem chamar conetor.
   * Retorna { record, idempotent } para que a camada de rota possa evitar auditoria duplicada.
   */
  async submitIntent(input: OrderIntentInput): Promise<SubmitIntentResult> {
    if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
      const err = Object.assign(new Error("Quantidade deve ser um número finito positivo."), { code: "INTENT_INVALID_QUANTITY" });
      throw err;
    }
    if (!["buy", "sell"].includes(input.side)) {
      const err = Object.assign(new Error("Lado inválido: deve ser 'buy' ou 'sell'."), { code: "INTENT_INVALID_SIDE" });
      throw err;
    }

    // Idempotência: devolver registo existente se chave já foi usada pelo mesmo utilizador
    if (input.idempotencyKey) {
      const existing = await this.orderIntentRepo.findByIdempotencyKey(input.idempotencyKey, input.userId);
      if (existing) return { record: existing, idempotent: true };
    }

    const connectorResponse = await this.connector.submit(input);

    const status =
      connectorResponse.status === "simulated" || connectorResponse.status === "filled" ? "filled" : "rejected";

    const record = await this.orderIntentRepo.create({
      ...input,
      mode: this.connector.mode,
      connectorResponseJson: JSON.stringify(connectorResponse),
      status,
    });
    return { record, idempotent: false };
  }
}
