/**
 * Hub WS: envelope `{ type, payload, ts }` (FR28 / NFR-P2).
 * `market.tick` só é enviado a clientes que subscreveram o `symbolInternal` via mensagem `subscribe`.
 * Outros tipos (ex. `source_health`) vão a todos os clientes ligados.
 */
type SendFn = (raw: string) => void;

export type RealtimeWsClient = {
  send: SendFn;
  /** Símbolos internos subscritos; vazio ⇒ nenhum `market.tick`. */
  symbolFilter: Set<string>;
};

const clients = new Set<RealtimeWsClient>();

export function registerWsClient(send: SendFn): RealtimeWsClient {
  const client: RealtimeWsClient = { send, symbolFilter: new Set() };
  clients.add(client);
  return client;
}

export function unregisterWsClient(client: RealtimeWsClient): void {
  clients.delete(client);
}

export function broadcastEnvelope(type: string, payload: unknown): void {
  const ts = new Date().toISOString();
  const raw = JSON.stringify({ type, payload, ts });
  for (const c of clients) {
    if (type === "market.tick" && payload && typeof payload === "object") {
      const sym = (payload as { symbolInternal?: string }).symbolInternal;
      if (!sym || !c.symbolFilter.has(sym)) continue;
    }
    try {
      c.send(raw);
    } catch {
      clients.delete(c);
    }
  }
}
