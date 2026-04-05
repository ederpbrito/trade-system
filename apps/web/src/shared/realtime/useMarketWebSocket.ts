import { useCallback, useEffect, useRef, useState } from "react";

export type MarketTick = {
  symbolInternal: string;
  timeframe: string;
  close: number;
  tsOpen: string;
  connectorId?: string;
};

type WsEnvelope = { type: string; payload: unknown; ts: string };

function streamUrl(): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/api/v1/stream`;
}

function subscribePayload(symbols: readonly string[]) {
  return JSON.stringify({
    type: "subscribe",
    payload: { symbols: [...symbols] },
  });
}

/**
 * Canal em tempo quase real (FR28): após ligar, envia `subscribe` com os símbolos pedidos.
 * Reconexão com *backoff* exponencial (máx. 30s). NFR-P2: agregação por símbolo + rAF.
 */
export function useMarketWebSocket(enabled: boolean, symbols: readonly string[]): MarketTick[] {
  const [ticks, setTicks] = useState<MarketTick[]>([]);
  const latestRef = useRef(new Map<string, MarketTick>());
  const rafRef = useRef<number | null>(null);
  const reconnectAttempt = useRef(0);
  const socketRef = useRef<WebSocket | null>(null);

  const flush = useCallback(() => {
    rafRef.current = null;
    setTicks(Array.from(latestRef.current.values()));
  }, []);

  const scheduleFlush = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(flush);
  }, [flush]);

  useEffect(() => {
    if (!enabled) return;

    let closed = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (closed) return;
      const ws = new WebSocket(streamUrl());
      socketRef.current = ws;

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(String(ev.data)) as WsEnvelope;
          if (msg.type === "market.tick" && msg.payload && typeof msg.payload === "object") {
            const pl = msg.payload as MarketTick;
            if (pl.symbolInternal) {
              latestRef.current.set(pl.symbolInternal, pl);
              scheduleFlush();
            }
          }
        } catch {
          /* ignorar payload inválido sob rajada */
        }
      };

      ws.onclose = () => {
        socketRef.current = null;
        if (closed) return;
        const delay = Math.min(30_000, 1000 * 2 ** reconnectAttempt.current);
        reconnectAttempt.current += 1;
        retryTimer = setTimeout(connect, delay);
      };

      ws.onopen = () => {
        reconnectAttempt.current = 0;
        ws.send(subscribePayload(symbols));
      };
    };

    connect();

    return () => {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      socketRef.current?.close();
      socketRef.current = null;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, scheduleFlush, symbols]);

  return ticks;
}
