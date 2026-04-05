import { describe, it, expect } from "vitest";
import { decryptJsonPayload, encryptJsonPayload } from "./credentials-crypto.js";

const TEST_KEY = "0".repeat(64);

describe("credentials-crypto", () => {
  it("roundtrip encriptação JSON", () => {
    const obj = { apiKey: "secret", region: "us" };
    const enc = encryptJsonPayload(TEST_KEY, obj);
    expect(enc).not.toContain("apiKey");
    const dec = decryptJsonPayload(TEST_KEY, enc);
    expect(dec).toEqual(obj);
  });
});
