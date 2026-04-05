import { describe, it, expect } from "vitest";
import { MockMarketDataProvider } from "./mock-market-data.provider.js";

describe("MockMarketDataProvider", () => {
  it("em modo normal gera barras e estado operacional", async () => {
    const p = new MockMarketDataProvider({ simulateFailure: "none" });
    const { bars, health } = await p.pullBars();
    expect(health.state).toBe("operational");
    expect(bars.length).toBeGreaterThan(0);
    expect(bars[0]?.symbolInternal).toContain("_TEST");
  });

  it("simula indisponível sem barras", async () => {
    const p = new MockMarketDataProvider({ simulateFailure: "unavailable" });
    const { bars, health } = await p.pullBars();
    expect(health.state).toBe("unavailable");
    expect(bars).toHaveLength(0);
  });

  it("simula degradada com barras e quality_flag", async () => {
    const p = new MockMarketDataProvider({ simulateFailure: "degraded" });
    const { bars, health } = await p.pullBars();
    expect(health.state).toBe("degraded");
    expect(bars.length).toBeGreaterThan(0);
    expect(bars[0]?.qualityFlag).toBe("stale_feed");
  });
});
