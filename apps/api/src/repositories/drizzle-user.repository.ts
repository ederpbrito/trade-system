import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import type { IUserReader, UserRecord } from "../services/identity/ports.js";

export class DrizzleUserRepository implements IUserReader {
  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const row = rows[0];
    if (!row) return undefined;
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
    };
  }

  async findById(id: string): Promise<UserRecord | undefined> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    const row = rows[0];
    if (!row) return undefined;
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
    };
  }
}
