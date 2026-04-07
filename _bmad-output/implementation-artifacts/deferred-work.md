# Trabalho adiado (defer)

## Deferred from: code review épico 2 — stories 2-1 a 2-6 (2026-04-05)

- **Migração Drizzle `ALTER users`**: a migração `0001_market_data.sql` inclui um `ALTER TABLE users` sobre `created_at`, gerado pelo *tooling*; pode causar lock desnecessário em bases grandes — reavaliar na próxima geração de migrações ou fundir com migração inicial se ainda for possível em ambientes verdes.

~~**N+1 em `OpportunitiesPreviewService.preview`**~~ — **Resolvido** (2026-04-05): `latestTsOpenForInstrumentIds` + `SELECT DISTINCT ON`.

## Deferred from: code review of 3-1-crud-da-lista-monitorizada (2026-04-06)

- **`loadWatchlist`/`loadCatalog` silenciam erros sem feedback ao utilizador** — `CockpitPage.tsx` faz `if (!res.ok) return;` sem `setLoadError`. Padrão consistente com o cockpit anterior, mas idealmente deveria mostrar mensagem de erro.
- **`candidateSort` enviado à API mas ordenação feita no cliente** — o parâmetro `?sort=` na rota `/opportunities/candidates` é redundante porque o cliente reordena em `filteredCandidates`. Simplificar: remover parâmetro da API ou remover ordenação no cliente.
- **`useViewportBand` sem debounce no resize** — cada evento de resize dispara `setBand` e potencial re-render. Adicionar debounce de ~150ms para melhorar performance em redimensionamentos contínuos.
- **`instrumentIds` com duplicados em `latestBarPerInstrumentIds`** — a watchlist tem `UNIQUE(user_id, instrument_id)`, pelo que duplicados são impossíveis em condições normais. Deduplicar defensivamente se a porta for reutilizada noutros contextos.
