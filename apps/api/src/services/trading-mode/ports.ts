/**
 * Portas do domínio de execução e modo de negociação.
 * FR17 — intenção de execução em modo demo.
 * FR18/FR19 — distinção demo vs produção; gate de produção.
 */

export type TradingMode = "demo" | "production";

export type OrderIntentInput = {
  userId: string;
  instrumentId: string;
  symbolInternal: string;
  /** buy | sell */
  side: "buy" | "sell";
  quantity: number;
  price?: number;
  timeframe?: string;
  horizonte?: string;
  candidateId?: string;
  /** Chave de idempotência opcional fornecida pelo cliente */
  idempotencyKey?: string;
};

export type ConnectorResponse = {
  connectorId: string;
  status: "filled" | "rejected" | "simulated";
  message?: string;
  externalRef?: string;
};

export type OrderIntentRecord = {
  id: string;
  userId: string;
  instrumentId: string;
  symbolInternal: string;
  side: string;
  quantity: number;
  price: number | null;
  mode: TradingMode;
  timeframe: string | null;
  horizonte: string | null;
  candidateId: string | null;
  connectorResponseJson: string | null;
  status: string;
  idempotencyKey: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Resultado de submitIntent: inclui flag de idempotência para evitar auditoria duplicada */
export type SubmitIntentResult = {
  record: OrderIntentRecord;
  /** true se foi um hit de idempotência (registo já existia) */
  idempotent: boolean;
};

export type OrderIntentFilter = {
  limit?: number;
  offset?: number;
};

export interface IOrderIntentRepository {
  create(
    input: OrderIntentInput & {
      mode: TradingMode;
      connectorResponseJson: string;
      status: string;
    },
  ): Promise<OrderIntentRecord>;
  findById(id: string): Promise<OrderIntentRecord | null>;
  findByIdempotencyKey(key: string, userId: string): Promise<OrderIntentRecord | null>;
  findByUserId(userId: string, filter?: OrderIntentFilter): Promise<OrderIntentRecord[]>;
}

/** Conetor de execução — abstracção sobre demo stub e produção real */
export interface IExecutionConnector {
  readonly connectorId: string;
  readonly mode: TradingMode;
  submit(input: OrderIntentInput): Promise<ConnectorResponse>;
}
