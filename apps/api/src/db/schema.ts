import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
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

export type Instrument = typeof instruments.$inferSelect;
export type WatchlistEntryRow = typeof watchlistEntries.$inferSelect;
export type OhlcBar = typeof ohlcBars.$inferSelect;
export type ConnectorHealthRow = typeof connectorHealth.$inferSelect;
export type IntegrationCredentialRow = typeof integrationCredentials.$inferSelect;
export type RiskLimitsRow = typeof riskLimits.$inferSelect;
export type RiskExceptionLogRow = typeof riskExceptionLog.$inferSelect;
