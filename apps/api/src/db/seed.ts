import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pgClient } from "./client.js";
import { users } from "./schema.js";

const email = process.env.SEED_USER_EMAIL ?? "admin@localhost";
const password = process.env.SEED_USER_PASSWORD ?? "changeme";

const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
if (existing.length > 0) {
  console.log(`User ${email} already exists, skip seed.`);
  await pgClient.end();
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 12);
await db.insert(users).values({ email, passwordHash });
console.log(`Seeded user ${email} (set SEED_USER_PASSWORD in env to override).`);
await pgClient.end();
