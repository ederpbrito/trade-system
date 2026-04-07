-- FR21: política versionada que influencia ranking de candidatos
CREATE TABLE IF NOT EXISTS "ranking_policies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "version" integer NOT NULL,
  "name" text NOT NULL,
  "weights_json" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "ranking_policies_version_uniq" ON "ranking_policies" ("version");

-- FR22: jobs de treino e avaliação em ambiente paper/demo
CREATE TYPE IF NOT EXISTS "training_job_status" AS ENUM ('queued', 'running', 'success', 'failed');
CREATE TABLE IF NOT EXISTS "training_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "policy_version" integer,
  "status" "training_job_status" NOT NULL DEFAULT 'queued',
  "params_json" text,
  "error_message" text,
  "started_at" timestamp with time zone,
  "finished_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "training_jobs_user_id_idx" ON "training_jobs" ("user_id");
CREATE INDEX IF NOT EXISTS "training_jobs_status_idx" ON "training_jobs" ("status");

-- FR23: persistência de métricas e artefactos de experimentos
CREATE TABLE IF NOT EXISTS "experiment_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "training_job_id" uuid REFERENCES "training_jobs"("id") ON DELETE SET NULL,
  "policy_version" integer NOT NULL,
  "dataset_hash" text NOT NULL,
  "metrics_json" text NOT NULL,
  "artifact_path" text,
  "label" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "experiment_runs_user_id_idx" ON "experiment_runs" ("user_id");
CREATE INDEX IF NOT EXISTS "experiment_runs_policy_version_idx" ON "experiment_runs" ("policy_version");
