---
story_key: 2-4-canal-websocket-para-atualizacoes-de-mercado
epic: 2
story: 4
status: done
generated: "2026-04-05"
---

# Story 2.4: Canal WebSocket para atualizações de mercado

Status: done

## Story

Como **Eder**,  
quero **receber atualizações em tempo quase real na interface**,  
para **FR28, UX-DR10 e NFR-P2**.

## Acceptance Criteria

**Given** sessão autenticada e subscrição a símbolos  
**When** a API publica evento `market.tick` ou agregado equivalente  
**Then** o cliente recebe mensagens no envelope `{ type, payload, ts }`  
**And** reconexão automática após queda é implementada (backoff)  
**And** sob rajada, a UI aplica estratégia de agregação/*throttle* documentada para não bloquear (NFR-P2)

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

### Review Findings

- [x] [Review][Decision] Subscrição por símbolo implementada (opção B): cliente envia `{ type: "subscribe", payload: { symbols } }`; o *hub* filtra `market.tick` por `symbolInternal`; `source_health` mantém-se para todos os clientes autenticados. [`apps/api/src/routes/v1/market-stream.ts`, `apps/api/src/composition/realtime-hub.ts`, `apps/web/src/shared/realtime/useMarketWebSocket.ts`]

## Dev Notes

### Referências de arquitetura (obrigatório seguir)

- Monorepo `pnpm`, `apps/web` (Vite+React+TS), `apps/api` (Fastify), `packages/shared`, PostgreSQL+Drizzle, REST `/api/v1`, WebSocket envelope `{ type, payload, ts }`.
- Naming: DB `snake_case`, JSON `camelCase`; erros `{ error: { code, message, requestId } }`.
- Conetores em `apps/api/src/connectors/`; domínio em `services/`; rotas em `routes/v1/`.
- Ver `_bmad-output/planning-artifacts/architecture.md` (ADR-001 MT5, ADR-002 LLM/MCP).
- UX: `_bmad-output/planning-artifacts/ux-design-specification.md` (componentes cockpit, WCAG AA, layout 3 colunas).
### Notas para o agente de desenvolvimento

- Não reinventar pastas: seguir árvore em `architecture.md` » Project Structure.
- Não expor segredos ao cliente; credenciais só servidor.
- Testes: Vitest (web/api conforme pacote); contract tests em conetores quando aplicável.


### Referências explícitas

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 2.4]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Cursor agent (implementação única épico 2 — stories 2-1 a 2-6)

### Debug Log References

### Completion Notes List

- Servidor: `@fastify/websocket`, rota `GET /api/v1/stream` com validação de sessão no *handshake*; mensagem `subscribe` com lista `symbols`; `broadcastEnvelope` filtra `market.tick` por subscrição; `source_health` para todos os clientes autenticados.
- Cliente: `useMarketWebSocket(enabled, symbols)` — envia `subscribe` ao abrir; backoff até 30s; agregação por símbolo + `requestAnimationFrame` (NFR-P2).
- Vite: `proxy /api` com `ws: true`; README actualizado.

### File List

- apps/api/package.json
- apps/api/src/routes/v1/market-stream.ts
- apps/api/src/composition/realtime-hub.ts
- apps/api/src/composition/realtime-hub.test.ts
- apps/api/src/routes/v1/market-data.routes.ts
- apps/web/vite.config.ts
- apps/web/src/shared/realtime/useMarketWebSocket.ts
- apps/web/src/domains/cockpit/ui/CockpitPage.tsx
- README.md

### Change Log

- 2026-04-05: Story 2.4 implementada no âmbito do batch épico 2; estado sprint → review.
- 2026-04-05: Code review — estado → in-progress (decisão WS pendente).
- 2026-04-05: Correcção review — subscrição WS + filtro no *hub*; teste `realtime-hub.test.ts`; sprint → review.
- 2026-04-05: Épico 2 fechado — story `done`; `sprint-status` actualizado.
