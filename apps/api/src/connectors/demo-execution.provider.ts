/**
 * Conetor de execução demo/stub.
 * FR17 — simula submissão de ordem sem executar produção.
 * Nunca envia ordens reais; resposta é sempre "simulated".
 */
import type { IExecutionConnector, OrderIntentInput, ConnectorResponse } from "../services/trading-mode/ports.js";

export class DemoExecutionProvider implements IExecutionConnector {
  readonly connectorId = "demo-stub";
  readonly mode = "demo" as const;

  async submit(input: OrderIntentInput): Promise<ConnectorResponse> {
    // Simula latência mínima de conetor real
    await Promise.resolve();
    return {
      connectorId: this.connectorId,
      status: "simulated",
      message: `Ordem demo simulada: ${input.side.toUpperCase()} ${input.quantity} ${input.symbolInternal}`,
      externalRef: `DEMO-${Date.now()}`,
    };
  }
}
