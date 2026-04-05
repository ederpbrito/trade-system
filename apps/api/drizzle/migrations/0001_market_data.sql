CREATE TYPE "public"."connector_state" AS ENUM('operational', 'degraded', 'unavailable');--> statement-breakpoint
CREATE TABLE "connector_health" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connector_id" text NOT NULL,
	"state" "connector_state" DEFAULT 'operational' NOT NULL,
	"last_heartbeat_at" timestamp with time zone,
	"latency_ms" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connector_health_connector_id_unique" UNIQUE("connector_id")
);
--> statement-breakpoint
CREATE TABLE "instruments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol_internal" text NOT NULL,
	"symbol_mt5" text,
	"venue" text,
	"connector_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instruments_symbol_internal_unique" UNIQUE("symbol_internal")
);
--> statement-breakpoint
CREATE TABLE "integration_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_key" text NOT NULL,
	"encrypted_payload" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "integration_credentials_source_key_unique" UNIQUE("source_key")
);
--> statement-breakpoint
CREATE TABLE "ohlc_bars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrument_id" uuid NOT NULL,
	"timeframe" text NOT NULL,
	"ts_open" timestamp with time zone NOT NULL,
	"open" double precision NOT NULL,
	"high" double precision NOT NULL,
	"low" double precision NOT NULL,
	"close" double precision NOT NULL,
	"volume" double precision,
	"source" text NOT NULL,
	"quality_flag" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ohlc_bars" ADD CONSTRAINT "ohlc_bars_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ohlc_bars_instrument_timeframe_ts_open" ON "ohlc_bars" USING btree ("instrument_id","timeframe","ts_open");