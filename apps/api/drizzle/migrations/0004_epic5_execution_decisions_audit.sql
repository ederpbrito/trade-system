CREATE TYPE "public"."trading_mode" AS ENUM('demo', 'production');--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"mode" "trading_mode" NOT NULL,
	"timeframe" text,
	"horizonte" text,
	"correlation_id" text,
	"entity_id" text,
	"entity_type" text,
	"payload_json" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decision_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"decision" text NOT NULL,
	"instrument_id" uuid NOT NULL,
	"symbol_internal" text NOT NULL,
	"timeframe" text,
	"horizonte" text,
	"candidate_id" text,
	"order_intent_id" uuid,
	"rationale" text NOT NULL,
	"tags_json" text,
	"note" text,
	"mode" "trading_mode" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_intents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"instrument_id" uuid NOT NULL,
	"symbol_internal" text NOT NULL,
	"side" text NOT NULL,
	"quantity" double precision NOT NULL,
	"price" double precision,
	"mode" "trading_mode" NOT NULL,
	"timeframe" text,
	"horizonte" text,
	"candidate_id" text,
	"connector_response_json" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"idempotency_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_log" ADD CONSTRAINT "decision_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_log" ADD CONSTRAINT "decision_log_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_log" ADD CONSTRAINT "decision_log_order_intent_id_order_intents_id_fk" FOREIGN KEY ("order_intent_id") REFERENCES "public"."order_intents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_intents" ADD CONSTRAINT "order_intents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_intents" ADD CONSTRAINT "order_intents_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_events_user_id_idx" ON "audit_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_events_occurred_at_idx" ON "audit_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "audit_events_event_type_idx" ON "audit_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "decision_log_user_id_idx" ON "decision_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "decision_log_instrument_id_idx" ON "decision_log" USING btree ("instrument_id");--> statement-breakpoint
CREATE INDEX "decision_log_created_at_idx" ON "decision_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "order_intents_user_id_idx" ON "order_intents" USING btree ("user_id");