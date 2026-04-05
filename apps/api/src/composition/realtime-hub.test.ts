import { describe, it, expect, vi } from "vitest";
import { broadcastEnvelope, registerWsClient, unregisterWsClient } from "./realtime-hub.js";

describe("realtime-hub", () => {
  it("filtra market.tick por subscrição de símbolo", () => {
    const sent: string[] = [];
    const client = registerWsClient((raw) => {
      sent.push(raw);
    });
    client.symbolFilter.add("AAA");
    client.symbolFilter.add("BBB");

    broadcastEnvelope("market.tick", { symbolInternal: "AAA", close: 1 });
    broadcastEnvelope("market.tick", { symbolInternal: "ZZZ", close: 2 });
    broadcastEnvelope("source_health", { connectorId: "mock", state: "operational" });

    unregisterWsClient(client);

    const types = sent.map((s) => (JSON.parse(s) as { type: string }).type);
    expect(types.filter((t) => t === "market.tick")).toHaveLength(1);
    expect(types).toContain("source_health");
    const tickSyms = sent
      .map((s) => JSON.parse(s) as { type: string; payload?: { symbolInternal?: string } })
      .filter((m) => m.type === "market.tick")
      .map((m) => m.payload?.symbolInternal);
    expect(tickSyms).toEqual(["AAA"]);
  });

  it("sem subscrição não recebe market.tick", () => {
    const send = vi.fn();
    const client = registerWsClient(send);
    broadcastEnvelope("market.tick", { symbolInternal: "AAA", close: 1 });
    expect(send).not.toHaveBeenCalled();
    unregisterWsClient(client);
  });
});
