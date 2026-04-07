export type TrainingJobStatus = "queued" | "running" | "success" | "failed";

export type TrainingJob = {
  id: string;
  userId: string;
  policyVersion: number | null;
  status: TrainingJobStatus;
  paramsJson: string | null;
  errorMessage: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
};

export type CreateTrainingJobInput = {
  userId: string;
  policyVersion?: number;
  paramsJson?: string;
};

export interface ITrainingJobRepository {
  create(input: CreateTrainingJobInput): Promise<TrainingJob>;
  findById(id: string): Promise<TrainingJob | null>;
  listByUserId(userId: string): Promise<TrainingJob[]>;
  updateStatus(id: string, status: TrainingJobStatus, extra?: { errorMessage?: string; startedAt?: Date; finishedAt?: Date }): Promise<TrainingJob>;
}
