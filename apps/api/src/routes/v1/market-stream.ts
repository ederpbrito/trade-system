import websocket from "@fastify/websocket";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { registerWsClient, unregisterWsClient } from "../../composition/realtime-hub.js";

/**
 * WebSocket autenticado (cookie no *handshake*).
 * Cliente → servidor: `{ "type": "subscribe", "payload": { "symbols": ["EURUSD_TEST", ...] } }`
 * Servidor → cliente: envelope `{ type, payload, ts }`.
 */
const marketStreamPlugin: FastifyPluginAsync = async (app) => {
  await app.register(websocket);

  app.get("/api/v1/stream", { websocket: true }, (socket, request) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) {
      socket.close(1008, "Unauthorized");
      return;
    }

    const client = registerWsClient((raw) => {
      if (socket.readyState === 1) {
        socket.send(raw);
      }
    });

    const cleanup = () => {
      unregisterWsClient(client);
    };

    socket.on("message", (buf: string | Buffer, isBinary: boolean) => {
      if (isBinary) return;
      const text = typeof buf === "string" ? buf : buf.toString("utf8");
      try {
        const msg = JSON.parse(text) as { type?: string; payload?: { symbols?: unknown } };
        if (msg.type === "subscribe" && Array.isArray(msg.payload?.symbols)) {
          client.symbolFilter.clear();
          for (const s of msg.payload!.symbols!) {
            if (typeof s === "string" && s.length > 0) {
              client.symbolFilter.add(s);
            }
          }
        }
      } catch {
        /* JSON inválido — ignorar */
      }
    });

    socket.on("close", cleanup);
    socket.on("error", cleanup);
  });
};

export default fp(marketStreamPlugin, { name: "market-stream" });
