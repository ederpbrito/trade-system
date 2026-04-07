# Trabalho adiado (defer)

## Deferred from: code review épico 2 — stories 2-1 a 2-6 (2026-04-05)

- **Migração Drizzle `ALTER users`**: a migração `0001_market_data.sql` inclui um `ALTER TABLE users` sobre `created_at`, gerado pelo *tooling*; pode causar lock desnecessário em bases grandes — reavaliar na próxima geração de migrações ou fundir com migração inicial se ainda for possível em ambientes verdes.

~~**N+1 em `OpportunitiesPreviewService.preview`**~~ — **Resolvido** (2026-04-05): `latestTsOpenForInstrumentIds` + `SELECT DISTINCT ON`.

## Deferred from: code review of 3-1-crud-da-lista-monitorizada (2026-04-06)

- **`loadWatchlist`/`loadCatalog` silenciam erros sem feedback ao utilizador** — `CockpitPage.tsx` faz `if (!res.ok) return;` sem `setLoadError`. Padrão consistente com o cockpit anterior, mas idealmente deveria mostrar mensagem de erro.
- **`candidateSort` enviado à API mas ordenação feita no cliente** — o parâmetro `?sort=` na rota `/opportunities/candidates` é redundante porque o cliente reordena em `filteredCandidates`. Simplificar: remover parâmetro da API ou remover ordenação no cliente.
- **`useViewportBand` sem debounce no resize** — cada evento de resize dispara `setBand` e potencial re-render. Adicionar debounce de ~150ms para melhorar performance em redimensionamentos contínuos.
- **`instrumentIds` com duplicados em `latestBarPerInstrumentIds`** — a watchlist tem `UNIQUE(user_id, instrument_id)`, pelo que duplicados são impossíveis em condições normais. Deduplicar defensivamente se a porta for reutilizada noutros contextos.

## Deferred from: code review épico 6 — stories 6-1 a 6-4 (2026-04-07)

- **Tipos duplicados API/web sem partilha via `packages/shared`** — `ThesisSection`, `WindowConflict`, `RiskRelation`, `AssistantThesisResponse` estão definidos em `ports.ts` (API) e repetidos em `AssistantPanel.tsx` (web). Uma mudança no contrato requer actualização manual em dois sítios. Mover para `packages/shared` quando o contrato estabilizar.
- **Sem validação de valores permitidos para `timeframe`/`horizonte` na rota** — a rota `GET /api/v1/assistant/thesis` aceita qualquer string; valores inválidos como `"XYZ"` passam sem erro. Adicionar validação de enum (ex: `M15|H1|H4|D1`) em épico de hardening da API.
- **`instrumentId` não validado contra DB na rota do assistente** — qualquer string é aceite; não há verificação de que o instrumento existe. Adicionar lookup defensivo em épico de hardening.
- **Sem fallback para `schemaVersion` desconhecida na UI** — se a API evoluir para `schemaVersion: "2.0"`, a UI pode quebrar silenciosamente. Adicionar lógica de fallback/versioning na UI quando o contrato evoluir.
- **`currentDailyLoss`/`currentPositionSize` não passados à API → headroom assume 0** — o headroom calculado é teórico (máximo disponível sem posições abertas). Decisão: aceitar como estimativa conservadora até haver dados reais de posições (épico de gestão de carteira).

## Deferred from: code review épico 5 — stories 5-1 a 5-9 (2026-04-07)

- **Auditoria falha em silêncio (decision.created e execution.intent)** — auditoria é best-effort por design no MVP; eventos podem falhar sem impacto na operação principal. Rever em épico de resiliência/observabilidade: considerar fila de eventos ou retry.
- **Métricas truncadas a 1000 registos sem indicação ao utilizador** — `MetricsService.getSummary` usa `limit: 1000`; utilizadores com mais dados recebem métricas parciais sem aviso. Adicionar flag `isTruncated` e/ou paginação em épico de métricas avançadas.
- **Auditoria sem `offset` (paginação incompleta além do `limit`)** — `AuditFilter` não tem `offset`; não é possível paginar além dos primeiros `limit` eventos. Adicionar cursor-based pagination em épico de auditoria avançada.
- **Validação HTTP por cast em vez de schema declarativo** — rotas usam `req.body as { ... }` sem Zod/JSON Schema; tipos errados ou campos extra não são rejeitados na camada HTTP. Migrar para Zod em refactoring transversal de validação.

## Deferred from: code review épico 7 — stories 7-1 a 7-4 (2026-04-07)

- **`JSON.parse` sem validação em políticas e experimentos** — `drizzle-ranking-policy.repository.ts` (`weightsJson`) e `drizzle-experiment.repository.ts` (`metricsJson`): dados corruptos na BD podem causar 500 não tratado. Tratar com Zod/parse seguro ou erro de domínio mapeado.
- **Treino síncrono no pedido HTTP** — `createAndRun` executa o ciclo completo na thread do pedido; aceitável no MVP com simulação instantânea, mas arrisca *timeouts* quando o treino for pesado. Considerar fila/worker noutro épico.
