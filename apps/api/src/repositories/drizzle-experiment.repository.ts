import { desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { experimentRuns } from "../db/schema.js";
import type { IExperimentRepository, ExperimentRun, CreateExperimentInput, ExperimentMetrics } from "../services/experiments/ports.js";

function rowToExperiment(row: typeof experimentRuns.$inferSelect): ExperimentRun {
  return {
    id: row.id,
    userId: row.userId,
    trainingJobId: row.trainingJobId,
    policyVersion: row.policyVersion,
    datasetHash: row.datasetHash,
    metrics: JSON.parse(row.metricsJson) as ExperimentMetrics,
    artifactPath: row.artifactPath,
    label: row.label,
    createdAt: row.createdAt,
  };
}

export class DrizzleExperimentRepository implements IExperimentRepository {
  async create(input: CreateExperimentInput): Promise<ExperimentRun> {
    const rows = await db
      .insert(experimentRuns)
      .values({
        userId: input.userId,
        trainingJobId: input.trainingJobId ?? null,
        policyVersion: input.policyVersion,
        datasetHash: input.datasetHash,
        metricsJson: input.metricsJson,
        artifactPath: input.artifactPath ?? null,
        label: input.label ?? null,
      })
      .returning();
    return rowToExperiment(rows[0]!);
  }

  async findById(id: string): Promise<ExperimentRun | null> {
    const rows = await db.select().from(experimentRuns).where(eq(experimentRuns.id, id)).limit(1);
    if (rows.length === 0) return null;
    return rowToExperiment(rows[0]!);
  }

  async listByUserId(userId: string): Promise<ExperimentRun[]> {
    const rows = await db.select().from(experimentRuns).where(eq(experimentRuns.userId, userId)).orderBy(desc(experimentRuns.createdAt));
    return rows.map(rowToExperiment);
  }
}
