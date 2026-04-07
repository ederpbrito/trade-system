import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;

/** FR1 / FR4 — prioridade na lista monitorizada */
export const watchlistPriorityEnum = pgEnum("watchlist_priority", ["low", "medium", "high"]);

/** FR26 — estados operacional / degradada / indisponível */
export const connectorStateEnum = pgEnum("connector_state", ["operational", "degraded", "unavailable"]);

export const instruments = pgTable("instruments", {
  id: uuid("id").primaryKey().defaultRandom(),
  symbolInternal: text("symbol_internal").notNull().unique(),
  symbolMt5: text("symbol_mt5"),
  venue: text("venue"),
  connectorId: text("connector_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const watchlistEntries = pgTable(
  "watchlist_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    instrumentId: uuid("instrument_id")
      .references(() => instruments.id, { onDelete: "cascade" })
      .notNull(),
    priority: watchlistPriorityEnum("priority").notNull().default("medium"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userInstrumentUnique: uniqueIndex("watchlist_entries_user_instrument").on(t.userId, t.instrumentId),
  }),
);

export const ohlcBars = pgTable(
  "ohlc_bars",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    instrumentId: uuid("instrument_id")
      .references(() => instruments.id, { onDelete: "cascade" })
      .notNull(),
    timeframe: text("timeframe").notNull(),
    tsOpen: timestamp("ts_open", { withTimezone: true }).notNull(),
    open: doublePrecision("open").notNull(),
    high: doublePrecision("high").notNull(),
    low: doublePrecision("low").notNull(),
    close: doublePrecision("close").notNull(),
    volume: doublePrecision("volume"),
    source: text("source").notNull(),
    qualityFlag: text("quality_flag"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    instrumentTfTs: uniqueIndex("ohlc_bars_instrument_timeframe_ts_open").on(t.instrumentId, t.timeframe, t.tsOpen),
  }),
);

export const connectorHealth = pgTable("connector_health", {
  id: uuid("id").primaryKey().defaultRandom(),
  connectorId: text("connector_id").notNull().unique(),
  state: connectorStateEnum("state").notNull().default("operational"),
  lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true }),
  latencyMs: integer("latency_ms"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Segredos de integração: payload encriptado (servidor); nunca expor em leituras à SPA */
export const integrationCredentials = pgTable("integration_credentials", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceKey: text("source_key").notNull().unique(),
  encryptedPayload: text("encrypted_payload").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * FR13/FR35 — limites de risco configuráveis por utilizador.
 * Um registo por utilizador (upsert); campos nulos = limite não configurado.
 */
export const riskLimits = pgTable("risk_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  /** Tamanho máximo de posição (unidades/lotes) */
  maxPositionSize: doublePrecision("max_position_size"),
  /** Perda máxima diária (valor monetário) */
  maxDailyLoss: doublePrecision("max_daily_loss"),
  /** Concentração máxima por ativo (0–1, ex.: 0.20 = 20%) */
  maxConcentration: doublePrecision("max_concentration"),
  /** Exposição total máxima (valor monetário) */
  maxTotalExposure: doublePrecision("max_total_exposure"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * FR15/FR29 — registo de exceções a limites de risco (trilha auditável).
 */
export const riskExceptionLog = pgTable("risk_exception_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  /** Qual limite foi violado */
  limitKey: text("limit_key").notNull(),
  /** Valor proposto que causou a violação */
  proposedValue: doublePrecision("proposed_value").notNull(),
  /** Limite configurado no momento */
  limitValue: doublePrecision("limit_value").notNull(),
  /** Motivo de exceção fornecido pelo utilizador */
  reason: text("reason").notNull(),
  /** Contexto opcional (candidateId, instrumentId, etc.) */
  contextJson: text("context_json"),
  /** Indica se a exceção foi aprovada (true) ou bloqueada (false) */
  approved: boolean("approved").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * FR17/FR18 — modo de negociação da instância.
 * demo: conetor stub sem execução real.
 * production: conetor real (requer gates).
 */
export const tradingModeEnum = pgEnum("trading_mode", ["demo", "production"]);

/**
 * FR17 — intenções de execução (demo e produção).
 * Registo append-only; nunca apagar.
 */
export const orderIntents = pgTable(
  "order_intents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    /** Instrumento alvo */
    instrumentId: uuid("instrument_id")
      .references(() => instruments.id, { onDelete: "restrict" })
      .notNull(),
    symbolInternal: text("symbol_internal").notNull(),
    /** buy | sell */
    side: text("side").notNull(),
    /** Quantidade/lotes */
    quantity: doublePrecision("quantity").notNull(),
    /** Preço de entrada proposto (pode ser nulo em ordens a mercado) */
    price: doublePrecision("price"),
    /** Modo no momento da intenção */
    mode: tradingModeEnum("mode").notNull(),
    /** Timeframe da janela de operação */
    timeframe: text("timeframe"),
    /** Horizonte da janela de operação */
    horizonte: text("horizonte"),
    /** Candidato associado (se existir) */
    candidateId: text("candidate_id"),
    /** Resposta do conetor (JSON serializado) */
    connectorResponseJson: text("connector_response_json"),
    /** Estado: pending | filled | rejected | cancelled */
    status: text("status").notNull().default("pending"),
    /** Chave de idempotência (opcional; cliente pode fornecer) */
    idempotencyKey: text("idempotency_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("order_intents_user_id_idx").on(t.userId),
    /** D1: garante unicidade de chave de idempotência por utilizador (evita IDOR e duplicados) */
    idempotencyUniqueIdx: unique("order_intents_user_idempotency_key_uniq").on(t.userId, t.idempotencyKey),
  }),
);

/**
 * FR20 — registo de decisão com racional estruturado.
 * Persiste a decisão final (operar / não operar) e o racional do utilizador.
 */
export const decisionLog = pgTable(
  "decision_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    /** operar | nao_operar */
    decision: text("decision").notNull(),
    /** Instrumento alvo */
    instrumentId: uuid("instrument_id")
      .references(() => instruments.id, { onDelete: "restrict" })
      .notNull(),
    symbolInternal: text("symbol_internal").notNull(),
    /** Timeframe da janela de operação */
    timeframe: text("timeframe"),
    /** Horizonte da janela de operação */
    horizonte: text("horizonte"),
    /** Candidato associado */
    candidateId: text("candidate_id"),
    /** Intenção de execução associada (se existir) */
    orderIntentId: uuid("order_intent_id").references(() => orderIntents.id, { onDelete: "set null" }),
    /** Motivo principal (campo obrigatório conforme UX-DR8) */
    rationale: text("rationale").notNull(),
    /** Tags opcionais (JSON array de strings) */
    tagsJson: text("tags_json"),
    /** Nota breve opcional */
    note: text("note"),
    /** Modo no momento da decisão */
    mode: tradingModeEnum("mode").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("decision_log_user_id_idx").on(t.userId),
    instrumentIdx: index("decision_log_instrument_id_idx").on(t.instrumentId),
    createdAtIdx: index("decision_log_created_at_idx").on(t.createdAt),
  }),
);

/**
 * FR29 — trilha auditável de decisões e execuções.
 * Append-only; nunca apagar registos.
 */
export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    /** Tipo de evento: decision.created | execution.intent | risk.exception | mode.changed */
    eventType: text("event_type").notNull(),
    /** Modo no momento do evento */
    mode: tradingModeEnum("mode").notNull(),
    /** Timeframe da janela (se aplicável) */
    timeframe: text("timeframe"),
    /** Horizonte da janela (se aplicável) */
    horizonte: text("horizonte"),
    /** ID de correlação (requestId do pedido HTTP que gerou o evento) */
    correlationId: text("correlation_id"),
    /** ID da entidade relacionada (decisionId, orderIntentId, etc.) */
    entityId: text("entity_id"),
    /** Tipo da entidade relacionada */
    entityType: text("entity_type"),
    /** Payload completo do evento (JSON) */
    payloadJson: text("payload_json").notNull(),
    /** Timestamp UTC do evento */
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("audit_events_user_id_idx").on(t.userId),
    occurredAtIdx: index("audit_events_occurred_at_idx").on(t.occurredAt),
    eventTypeIdx: index("audit_events_event_type_idx").on(t.eventType),
  }),
);

export type Instrument = typeof instruments.$inferSelect;
export type WatchlistEntryRow = typeof watchlistEntries.$inferSelect;
export type OhlcBar = typeof ohlcBars.$inferSelect;
export type ConnectorHealthRow = typeof connectorHealth.$inferSelect;
export type IntegrationCredentialRow = typeof integrationCredentials.$inferSelect;
export type RiskLimitsRow = typeof riskLimits.$inferSelect;
export type RiskExceptionLogRow = typeof riskExceptionLog.$inferSelect;
export type OrderIntentRow = typeof orderIntents.$inferSelect;
export type DecisionLogRow = typeof decisionLog.$inferSelect;
export type AuditEventRow = typeof auditEvents.$inferSelect;
