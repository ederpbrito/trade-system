import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const SALT = "tradesystem-credentials-v1";

function keyFromEnv(hexKey: string): Buffer {
  return Buffer.from(hexKey, "hex");
}

/** ciphertext: base64(iv || tag || enc) */
export function encryptJsonPayload(hexKey: string, obj: Record<string, unknown>): string {
  const key = keyFromEnv(hexKey);
  if (key.length !== 32) {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY deve ser 64 caracteres hex (32 bytes).");
  }
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const plain = JSON.stringify(obj);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptJsonPayload(hexKey: string, b64: string): Record<string, unknown> {
  const key = keyFromEnv(hexKey);
  const buf = Buffer.from(b64, "base64");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + 16);
  const enc = buf.subarray(IV_LEN + 16);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  return JSON.parse(plain) as Record<string, unknown>;
}

/** Deriva chave de teste determinística (apenas testes / dev sem chave configurada). */
export function deriveDevKeyFromSecret(secret: string): string {
  const raw = scryptSync(secret, SALT, 32);
  return raw.toString("hex");
}
