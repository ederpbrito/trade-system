import {
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

export type Instrument = typeof instruments.$inferSelect;
export type OhlcBar = typeof ohlcBars.$inferSelect;
export type ConnectorHealthRow = typeof connectorHealth.$inferSelect;
export type IntegrationCredentialRow = typeof integrationCredentials.$inferSelect;
