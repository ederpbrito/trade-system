import { desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { trainingJobs } from "../db/schema.js";
import type { ITrainingJobRepository, TrainingJob, CreateTrainingJobInput, TrainingJobStatus } from "../services/training/ports.js";

function rowToJob(row: typeof trainingJobs.$inferSelect): TrainingJob {
  return {
    id: row.id,
    userId: row.userId,
    policyVersion: row.policyVersion,
    status: row.status as TrainingJobStatus,
    paramsJson: row.paramsJson,
    errorMessage: row.errorMessage,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    createdAt: row.createdAt,
  };
}

export class DrizzleTrainingJobRepository implements ITrainingJobRepository {
  async create(input: CreateTrainingJobInput): Promise<TrainingJob> {
    const rows = await db
      .insert(trainingJobs)
      .values({
        userId: input.userId,
        policyVersion: input.policyVersion ?? null,
        status: "queued",
        paramsJson: input.paramsJson ?? null,
      })
      .returning();
    return rowToJob(rows[0]!);
  }

  async findById(id: string): Promise<TrainingJob | null> {
    const rows = await db.select().from(trainingJobs).where(eq(trainingJobs.id, id)).limit(1);
    if (rows.length === 0) return null;
    return rowToJob(rows[0]!);
  }

  async listByUserId(userId: string): Promise<TrainingJob[]> {
    const rows = await db.select().from(trainingJobs).where(eq(trainingJobs.userId, userId)).orderBy(desc(trainingJobs.createdAt));
    return rows.map(rowToJob);
  }

  async updateStatus(
    id: string,
    status: TrainingJobStatus,
    extra?: { errorMessage?: string; startedAt?: Date; finishedAt?: Date },
  ): Promise<TrainingJob> {
    const rows = await db
      .update(trainingJobs)
      .set({
        status,
        errorMessage: extra?.errorMessage ?? null,
        startedAt: extra?.startedAt,
        finishedAt: extra?.finishedAt,
      })
      .where(eq(trainingJobs.id, id))
      .returning();
    return rowToJob(rows[0]!);
  }
}
