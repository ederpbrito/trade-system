# Trabalho adiado (defer)

## Deferred from: code review épico 2 — stories 2-1 a 2-6 (2026-04-05)

- **Migração Drizzle `ALTER users`**: a migração `0001_market_data.sql` inclui um `ALTER TABLE users` sobre `created_at`, gerado pelo *tooling*; pode causar lock desnecessário em bases grandes — reavaliar na próxima geração de migrações ou fundir com migração inicial se ainda for possível em ambientes verdes.

~~**N+1 em `OpportunitiesPreviewService.preview`**~~ — **Resolvido** (2026-04-05): `latestTsOpenForInstrumentIds` + `SELECT DISTINCT ON`.
