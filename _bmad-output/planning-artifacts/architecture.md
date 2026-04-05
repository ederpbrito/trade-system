---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-03-starter
  - step-04-decisions
  - step-05-patterns
  - step-06-structure
  - step-07-validation
  - step-08-complete
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-tradesystem.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: architecture
project_name: tradesystem
user_name: Eder
date: "2026-04-05T12:00:00Z"
status: complete
completedAt: "2026-04-05T18:00:00Z"
lastStep: step-08-complete
---

# Architecture Decision Document

_Este documento é construído em conjunto, passo a passo. As secções são acrescentadas à medida que avançamos nas decisões de arquitetura._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

O PRD define **36 requisitos funcionais (FR1–FR36)** agrupados em **9 áreas**, cada uma com implicações de componentes e limites:

| Área | FRs | Implicação arquitetural |
|------|-----|-------------------------|
| Carteira e monitorização | FR1–FR4 | Serviço de configuração de *watchlist*, modelo de ativo/mercado, API e cache de leitura para o cockpit |
| Oportunidades e janela | FR5–FR8 | Motor de candidatos com metadados **timeframe + horizonte**, persistência da janela em decisões |
| Assistente | FR9–FR12 | Camada de explicação (LLM ou regras + templates) com contexto do candidato, limites e plano |
| Gestão de risco | FR13–FR16 | Motor de políticas configurável, avaliação pré-decisão, fluxo de bloqueio/exceção auditável |
| Execução e modos | FR17–FR20 | Conetor de execução abstracto, **demo-first**, *gates* produção, registo estruturado de racional |
| Agente e aprendizado | FR21–FR24 | Política versionada, pipeline de treino/avaliação em paper, armazenamento de métricas e artefactos |
| Dados e tempo quase real | FR25–FR28 | Ingestão multi-fonte, estado de saúde, degradação de sinais, canal tempo real para UI |
| Auditoria e histórico | FR29–FR32 | Event sourcing leve ou trilha append-only com correlação temporal e janela |
| Acesso, segurança, configuração | FR33–FR36 | Autenticação de instância única, cofre de segredos, observabilidade com *correlation id* |

Não existem épicos/stories separados no *input*; a unidade de rastreio para implementação são estas **categorias de FR** e as **jornadas** do PRD.

**Non-Functional Requirements:**

- **Performance:** interações principais &lt; 200 ms com dados em cache; UI não bloqueia sob rajadas; *first paint* aceitável em rede doméstica.
- **Segurança:** TLS, segredos fora do repositório, sessão com mitigação CSRF em mutações, menor privilégio em chaves, dados sensíveis encriptados em repouso (ambiente).
- **Acessibilidade:** WCAG 2.1 AA nos fluxos críticos (alinhado à especificação de UX).
- **Integração:** falhas de fonte visíveis na UI em &lt; 30 s (ou intervalo documentado); *timeouts*, retentativas, *circuit breaker*; correlação entre camadas.

**Scale & Complexity:**

- **Domínio técnico principal:** *full-stack web* (SPA + API + dados + integrações externas + componente de ML/agente).
- **Nível de complexidade:** **alto** — tempo quase real, risco financeiro, auditoria, possível multi-mercado (B3/EUA), pipeline de aprendizado.
- **Componentes arquiteturais estimados (bounded contexts lógicos):** ~**11** — identidade/sessão, carteira, mercado/dados, candidatos/sinais, janela de operação, risco, execução/conetores, assistente, agente/experimentos, auditoria/eventos, configuração/segredos, tempo real.

### Technical Constraints & Dependencies

- **Uso pessoal, instância única:** sem multi-tenant no MVP; escalar para mais utilizadores é não-objetivo.
- **Demo antes de produção:** execução real condicionada a *gates* configuráveis e estado explícito no sistema.
- **Integrações externas variáveis:** camada de conetores para feeds e corretoras; contratos estáveis entre ingestão → motor de sinais → agente → UI (PRD).
- **UX fixa em desktop-first cockpit** com canal em tempo quase real (WebSocket ou SSE), alinhado à especificação de UX (layout três colunas recomendado).

### Cross-Cutting Concerns Identified

- **Correlação e trilha:** `correlation_id` / `request_id` em API, *logs* de decisão e eventos de execução.
- **Versionamento de política/modelo** ligado a outputs do agente e a *snapshots* de inputs quando possível.
- **Estado de fonte e degradação:** nunca apresentar candidatos como certos sem qualidade mínima de dados.
- **Modo demo vs. produção:** visível em toda a superfície de execução e nas APIs mutáveis.
- **Consistência de naming e formatos** entre API, base de dados e cliente (ver secção de padrões).

---

## Starter Template Evaluation

### Primary Technology Domain

**Aplicação web *full-stack*** com frontend SPA densamente interactivo e backend dedicado a API REST, tempo real, persistência relacional e jobs assíncronos — alinhado ao PRD e à UX (Vite + ecossistema React recomendado na especificação de UX via shadcn/ui + Tailwind).

### Starter Options Considered

| Opção | Prós | Contras |
|-------|------|---------|
| **Next.js (App Router)** | SSR/SSG, deploy simples | Modelo mental mais pesado para SPA + WS dedicado; menos alinhado a “API separada + canal RT” |
| **Vite + React + TS** | SPA rápida, *HMR*, aderência ao PRD “SPA”; combina com shadcn | Requer decisão explícita de *routing* e *data fetching* |
| **T3 Stack** | Integração tRPC + Prisma | Acoplamento forte se a API servir também clientes não-tRPC no futuro |
| **RedwoodJS** | Convenções fortes | Menos comum para *cockpit* fintech custom |

### Selected Starter: Vite + React + TypeScript (template `react-ts` ou `react-swc-ts`)

**Rationale for Selection:**

- Alinha com **SPA**, *code splitting* para gráficos e módulos pesados (PRD).
- Base estável e amplamente documentada para agentes de IA; integração natural com **shadcn/ui** e **Tailwind** (UX).
- Backend mantém-se **independente** (ver decisões nucleares), preservando contratos REST + WebSocket claros.

**Initialization Command (frontend):**

```bash
pnpm create vite@latest web --template react-ts
cd web && pnpm install
```

*Nota:* validar em [https://vite.dev](https://vite.dev) e [https://www.npmjs.com/package/create-vite](https://www.npmjs.com/package/create-vite) a sintaxe exacta do CLI na data da implementação. **Node.js:** usar versão **LTS** suportada pelo Vite (referência: documentação oficial do Vite para requisito mínimo de Node, tipicamente **20+** ou **22+**).

**Architectural Decisions Provided by Starter:**

- **Language & Runtime:** TypeScript no cliente; *bundler* Vite.
- **Styling:** a instalar **Tailwind CSS** + **shadcn/ui** como passo imediato pós-starter (decisão alinhada à UX).
- **Testing:** **Vitest** + **Testing Library** como padrão do ecossistema Vite/React.
- **Code Organization:** `src/` com componentes, *hooks*, rotas; evoluir para pastas por *feature* dentro de `src/features/`.

**Note:** A inicialização do **monorepo** (raiz com `apps/web` e `apps/api`) deve ser a primeira história de implementação estrutural, usando **pnpm workspaces** (recomendado) ou npm workspaces.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (bloqueiam implementação):**

1. **Forma do sistema:** monorepo com `apps/web` (SPA) e `apps/api` (serviço HTTP + WS).
2. **Base de dados:** **PostgreSQL** como fonte de verdade relacional (decisões, configuração, auditoria, experimentos).
3. **ORM / migrações:** **Drizzle ORM** com migrações versionadas em código (tipagem forte, SQL explícito).
4. **API:** **REST** versionada (`/api/v1/...`); **WebSocket** (ou SSE onde bastar) para mercado e estado de fontes.
5. **Autenticação (instância única):** sessão com **cookie httpOnly** + proteção CSRF em mutações; credenciais de integração apenas no servidor.
6. **Serviço de agente / ML:** processo **Python** (ex.: **FastAPI**) para treino, avaliação e inferência pesada, invocado pela API via HTTP interno ou fila; contrato partilhado em **JSON Schema** ou tipos gerados a partir de pacote comum.

**Important Decisions:**

- **Validação:** **Zod** nos limites (API *parse*, partilha opcional com frontend via pacote `packages/shared`).
- **Filas / jobs:** MVP com **tabela de jobs em PostgreSQL** ou **BullMQ + Redis** se já existir infraestrutura; evitar complexidade prematura.
- **Conetores:** interface `MarketDataProvider`, `ExecutionProvider` por implementação; configuração por instância.
- **Assistente:** interface estável `AssistantService` — MVP com **regras + templates** ou **LLM** atrás do mesmo contrato; não acoplar UI ao fornecedor.

**Deferred (post-MVP):**

- **gRPC** interno entre serviços (só se latência/escala o exigirem).
- **WebAssembly** no cliente (pista do PRD; só com métrica).

### Data Architecture

- **PostgreSQL** para entidades de domínio, *decision log*, configuração de risco, metadados de experimentos e filas leves se aplicável.
- **Modelagem:** chaves UUID em entidades expostas externamente; timestamps em **UTC** (`timestamptz`).
- **Migrações:** apenas via Drizzle (nunca SQL ad-hoc em produção sem migração).
- **Caching:** *cache* de leitura em memória no API ou Redis futuro; **invalidação** baseada em eventos de ingestão.

### Authentication & Security

- **Sessão** servidor; sem tokens JWT expostos em `localStorage` para sessão principal.
- **Segredos:** variáveis de ambiente + cofre (ex.: suporte a **Docker secrets** / provedor cloud); nunca em git.
- **Headers:** **CSP** restritiva progressiva, **HSTS** em produção, *SameSite* adequado nos cookies.
- **Auditoria:** eventos para mudança de limites, mudança demo→produção, e execuções.

### API & Communication Patterns

- **REST + JSON:** recursos no plural; códigos HTTP semânticos; erros com estrutura estável (ver padrões).
- **WebSocket:** canal único multiplexado por tipo de mensagem (`tick`, `candidate_update`, `source_health`) ou namespaces documentados.
- **Idempotência:** *endpoints* de execução onde o intermediário o permitir — chave de idempotência documentada.
- **OpenAPI:** gerar especificação a partir de rotas (plugin Fastify OpenAPI) para contrato com o frontend.

### Frontend Architecture

- **React 18+** com **TanStack Query** para dados servidor; estado local UI com **Zustand** ou **React context** mínimo.
- **Routing:** **React Router v7+** (escolha fechada neste repositório). Composição da aplicação em `apps/web/src/app/` (*shell*, router, *providers*); código por *bounded context* em `apps/web/src/domains/<contexto>/` (ex.: `identity`, `cockpit`); cliente HTTP e utilitários sem regra de negócio em `apps/web/src/shared/`.
- **Tempo real:** cliente WebSocket com *reconnect* exponencial e *backpressure* (descarte/agregação de *ticks* na UI).
- **Acessibilidade:** componentes shadcn como base; validação axe/Lighthouse nos fluxos críticos.

### Infrastructure & Deployment

- **Containers:** `Dockerfile` por app (`web`, `api`, opcional `agent`); `docker-compose` para desenvolvimento com PostgreSQL.
- **CI:** *lint*, *typecheck*, testes unitários e *e2e* mínimos nos percursos das jornadas (PRD).
- **Observabilidade:** logs estruturados (JSON), métricas HTTP e duração de jobs; *tracing* opcional OpenTelemetry.

### Decision Impact Analysis

**Implementation Sequence sugerida:**

1. Monorepo + PostgreSQL + API esqueleto + autenticação mínima.  
2. Modelos de carteira, fontes e saúde de dados.  
3. Canal tempo real + cockpit leitura.  
4. Candidatos e janela de operação.  
5. Risco + registo de decisão + demo execution *stub*.  
6. Assistente (contrato estável).  
7. Agente / experimentos (Python) e métricas.

**Cross-Component Dependencies:**

- UI depende de **OpenAPI** gerado ou tipos partilhados.  
- Agente depende de **snapshots** de dados versionados e de política.  
- Execução depende de **modo** (demo/produção) e de **risco**.

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Pontos críticos de conflito entre agentes:** ~**12** (naming JSON vs DB, pastas por *domain* vs mistura de contextos, formato de erros, eventos WS, *timezone*, IDs, etc.).

### Naming Patterns

- **Base de dados:** `snake_case` para tabelas e colunas (`decision_log`, `user_id`).
- **API JSON:** `camelCase` para campos públicos; mapeamento na camada de repositório/DTO.
- **REST:** substantivos no plural (`/api/v1/instruments`, `/api/v1/opportunities`).
- **Código TypeScript:** `PascalCase` componentes; `camelCase` funções/variáveis; ficheiros React em `PascalCase.tsx` para componentes, `kebab-case` para utilitários se o projeto escolher — **padrão único:** `PascalCase` para componentes UI, `camelCase.ts` para *hooks* (`useWatchlist.ts`).
- **Eventos WebSocket:** `dot.lower` (`market.tick`, `source.health`).

### Structure Patterns

- **Testes:** colocalizados `*.test.ts` junto ao módulo em `api`; em `web`, `*.test.tsx` junto a componentes críticos; *e2e* em `e2e/` na raiz ou `apps/web/e2e/`.
- **Domínios e modularização:** no **web**, cada contexto delimitado em `domains/<contexto>/` (subpastas `ui/`, `context/` ou equivalentes conforme o caso). Na **API**, casos de uso em `services/<domínio>/` com `ports.ts` (interfaces); persistência em `repositories/`; registo de plugins e *wiring* em `composition/`; rotas HTTP finas em `routes/v1/`. Regra operacional alinhada: `.cursor/rules/tradesystem-modular-solid.mdc` (SOLID, DIP: serviços não importam Drizzle directamente).
- **Config:** `.env.example` na raiz e por app; nunca commitar segredos.

### Format Patterns

- **Resposta de sucesso REST:** corpo directo ou `{ "data": T }` — **escolha única:** corpo directo para recursos; listas com `{ "items": [], "nextCursor?": "" }` quando paginadas.
- **Erros REST:** `{ "error": { "code": "STRING_MACHINE", "message": "Humano", "requestId": "uuid" } }`.
- **Datas:** ISO-8601 em UTC nas APIs.
- **IDs expostos:** UUID v4/v7 (string).

### Communication Patterns

- **WebSocket:** mensagem envelope `{ "type": "...", "payload": {}, "ts": "ISO" }`.
- **Logs:** níveis `error`, `warn`, `info`, `debug`; sempre incluir `requestId` quando existir.

### Process Patterns

- **Erros:** não engolir excepções em conetores — traduzir para códigos estáveis e estado de fonte degradado.
- **Loading UI:** *skeletons* em listas; evitar *spinners* fullscreen excepto primeira carga.

### Enforcement Guidelines

**Todos os agentes de IA devem:**

- Respeitar o mapa de pastas e os formatos de erro/ID acima.
- Não introduzir novo padrão de naming JSON sem actualizar este documento.
- Incluir `requestId` em logs e respostas de erro da API.

### Pattern Examples

**Bom:** `GET /api/v1/opportunities?horizon=day&timeframe=M15` → 200 com lista em `items`.  
**Evitar:** misturar `snake_case` no JSON público sem decisão documentada.

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
tradesystem/
├── package.json                 # workspaces root (npm ou pnpm)
├── pnpm-workspace.yaml
├── .env.example
├── .cursor/rules/               # regras Cursor (ex.: modular-solid)
├── docker-compose.yml           # postgres, opcional redis
├── README.md
├── e2e/                         # Playwright (fluxos críticos)
│   └── tests/
├── packages/
│   └── shared/                  # tipos Zod, constants
│       ├── package.json
│       └── src/
│           ├── schemas/
│           └── index.ts
├── apps/
│   ├── web/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── app/             # composição: App, shell, router, providers
│   │   │   ├── domains/         # um subdirectório por bounded context
│   │   │   │   ├── identity/    # ex.: context/, ui/
│   │   │   │   ├── cockpit/
│   │   │   │   # opportunity/, risk/, assistant/, settings/ — quando existirem
│   │   │   ├── shared/          # http, utilitários sem regra de negócio
│   │   │   ├── components/ui/   # shadcn (quando existir)
│   │   │   └── hooks/           # hooks partilhados (quando existirem)
│   │   └── public/
│   └── api/
│       ├── package.json
│       ├── src/
│       │   ├── index.ts         # entry Fastify
│       │   ├── app.ts           # buildApp / buildAppForServer
│       │   ├── composition/     # http-stack, create-app-services (wiring)
│       │   ├── config/
│       │   ├── plugins/         # request id, erros, CSRF, CORS, sessão
│       │   ├── routes/v1/       # adaptadores HTTP finos + *.test.ts
│       │   ├── services/        # <domínio>/ — casos de uso + ports.ts
│       │   ├── repositories/    # Drizzle (implementa portas)
│       │   ├── shared/          # ex.: formato de erro (sem domínio)
│       │   ├── types/           # augments (ex.: sessão)
│       │   ├── connectors/      # marketdata, execution
│       │   ├── ws/
│       │   ├── jobs/
│       │   └── db/              # drizzle client + schema + seed/migrate
│       └── drizzle/
│           └── migrations/
└── services/
    └── agent/                   # Python FastAPI (opcional MVP+)
        ├── pyproject.toml
        ├── README.md
        └── app/
            ├── main.py
            └── ...
```

### Architectural Boundaries

- **API boundaries:** *clients* externos apenas em `connectors/`; regras de negócio e orquestração em `services/<domínio>/` (dependendo de **portas**, não de Drizzle); persistência concreta em `repositories/`; transporte HTTP em `routes/v1/`; infra transversal (CORS, CSRF, sessão, *request id*) em `plugins/`; composição do grafo (registo de tudo) em `composition/`.
- **Frontend:** sem chamadas directas a corretoras; apenas API própria; UI e estado por contexto em `domains/`; ficheiros de composição da app em `app/`.
- **Agente:** sem acesso directo à DB de produção se possível — recebe *datasets* ou *job specs* via API interna.

### Requirements to Structure Mapping

| Categoria FR | Local principal |
|--------------|-----------------|
| Carteira / monitorização | `api/services/watchlist`, `web/domains/cockpit` |
| Oportunidades / janela | `api/services/opportunities`, `web/domains/opportunity` |
| Assistente | `api/services/assistant`, `web/domains/assistant` |
| Risco | `api/services/risk`, `web/domains/risk` |
| Execução / modos | `api/connectors/execution`, `api/services/trading-mode` |
| Agente / ML | `services/agent`, `api/routes/v1/experiments` |
| Dados / tempo real | `api/connectors/marketdata`, `api/ws` |
| Auditoria | `api/services/audit`, tabelas `decision_*` |
| Identidade / sessão (instância) | `api/services/identity`, `api/repositories/drizzle-user.repository.ts`, `api/routes/v1/identity.routes.ts`, `web/domains/identity` |
| Segurança transversal (CORS, CSRF, *request id*) | `api/plugins/`, `api/composition/http-stack.ts`, `api/config`, cofre env |

### Integration Points

- **Interna:** Web ↔ API (REST + WS); API ↔ Agent (HTTP interno).
- **Externa:** conetores sob interfaces estáveis; testes com *fixtures* e sandboxes quando existirem.

### Data Flow (resumo)

Ingestão → normalização → motor de candidatos → (opcional agente) → API → tempo real + REST → SPA. Decisões e execuções → trilha auditável na PostgreSQL.

---

## Architecture Validation Results

### Coherence Validation

- **Compatibilidade:** Vite/React no cliente e Fastify/PostgreSQL no servidor são combinação coerente e frequente; WS no mesmo processo API simplifica *auth* de canal.
- **Padrões:** `snake_case` (DB) + `camelCase` (JSON) com camada explícita evita divergências entre agentes.
- **Estrutura:** *tree* cobre todos os bounded contexts derivados dos FRs.

### Requirements Coverage Validation

- **FR1–FR36:** cobertos pelos serviços e *features* mapeados; FR32 (avisos de incerteza) na camada de UI + copy assistente.
- **NFRs:** endereçados em decisões de performance (WS *backpressure*, cache), segurança (sessão, segredos), integração (saúde de fonte, *circuit breaker* documentado nos conetores).

### Implementation Readiness Validation

- **Decisões críticas** documentadas; versões de Node/Vite a revalidar no momento do `pnpm create`.
- **Padrões** com exemplos; **estrutura** concreta para orientar PRs.

### Gap Analysis Results

| Prioridade | Lacuna | Mitigação |
|------------|--------|-----------|
| Resolvido | Escolha **React Router vs TanStack Router** | **React Router v7+**; composição em `apps/web/src/app/` (ver README). |
| Importante | Provedor concreto de dados/execução MVP | *Spike* em `connectors/` com implementação *mock* + uma implementação real; ver **ADR-001 (MT5)** |
| Nice | OpenTelemetry distribuído | Adiar até segunda fase de observabilidade |

### Architecture Completeness Checklist

- [x] Contexto e complexidade analisados  
- [x] Stack e limites decisão documentados  
- [x] Padrões para consistência entre agentes  
- [x] Estrutura de repositório e mapa FR → pastas  
- [x] Validação de coerência e cobertura  

### Architecture Readiness Assessment

**Overall status:** **READY FOR IMPLEMENTATION** (com revalidação pontual de versões de CLI e LTS Node).

**Confidence level:** **high** para o núcleo web+API+DB; **medium** para integrações de mercado até fechar o primeiro conector real.

**Strengths:** contratos claros, demo-first, alinhamento forte PRD + UX.

**Future enhancement:** Redis filas, *multi-region*, orquestração de contentores (**Kubernetes** apenas se no futuro fizer sentido multi-serviço, HA ou vários ambientes — **não** é requisito do MVP de uso pessoal; até lá bastam *Docker Compose* / VM única), WASM cliente, orquestração LLM/MCP (ver **ADR-002**).

### Implementation Handoff

**Directrizes para agentes de implementação:**

- Seguir este documento e a `ux-design-specification.md` para UI.
- Não contornar o motor de risco em chamadas de execução.
- Respeitar a árvore **Project Structure** abaixo e a regra `.cursor/rules/tradesystem-modular-solid.mdc` (módulos, domínios, SOLID).

**Primeira prioridade de implementação:**

1. Raiz monorepo + `apps/web` (Vite) + `apps/api` (Fastify) + PostgreSQL + autenticação mínima + healthcheck + WS *echo* autenticado.

**Estado do repositório (alinhado a esta secção):** monorepo com Vite/Fastify/PostgreSQL/Drizzle, healthcheck, identidade em `services/identity` + `repositories/` + `routes/v1/identity.routes.ts`, SPA com `app/` + `domains/identity` + `domains/cockpit`. *WebSocket echo* autenticado permanece como próximo passo opcional se ainda não estiver implementado.

---

## Registos de decisão arquitetural (ADR)

### ADR-001 — Integração MT5: *bridge* vs. *batch* e modelo de dados mínimo

| Campo | Conteúdo |
|-------|-----------|
| **Estado** | Aceite (2026-04-05) |
| **Contexto** | O produto precisa de **séries OHLC** e de **comandos de compra/venda** via ecossistema **MetaTrader 5**, tratando o MT5 como **componente integrável** (não como núcleo da lógica de negócio). O cockpit e o motor de risco continuam na **API**; o MT5 é um **conetor** (`ExecutionProvider` + fonte de dados de mercado). |
| **Ações EUA / B3** | O MT5 **não garante** acesso genérico a “ações dos EUA” no sentido de **conta numa corretora americana DMA**. O que existe, na prática, depende da **corretora/Broker** ligada ao terminal: muitas oferecem **CFDs** ou instrumentos sintéticos sobre *equities* dos EUA; **B3** só estará disponível se o teu *broker* MT5 expuser esses símbolos. Para **ações EUA com API própria** (ex. Alpaca, IBKR), o desenho previsto continua a ser **outro conetor** paralelo ao MT5 — mesmo modelo interno de instrumentos, implementação diferente. |
| **Opções de integração** | **A) *Batch* (pull):** *jobs* periódicos na API pedem barras fechadas (OHLC) ao *bridge* ou ao terminal; menor complexidade, latência maior, adequado a **horizontes intradiário+** e MVP. **B) *Bridge* em tempo quase real:** componente junto ao MT5 (EA, *script*, serviço local) que publica ticks/barras e recebe intenções de ordem via **socket/ZeroMQ/gRPC/HTTP local**; a API consome via `MarketDataProvider` / `ExecutionProvider`. **C) Híbrido:** *batch* para histórico e backfill; *bridge* para janela de negociação ativa. |
| **Decisão** | Adoptar **interface interna única** (`MarketDataProvider`, `ExecutionProvider`) com **implementação MT5** desacoplada. **MVP recomendado:** **híbrido leve** — ingestão **batch** de OHLC por timeframe configurável + **bridge** mínimo ou fila local para **estado da fonte** e, quando exigido pelo MVP, **envio de ordens** com **idempotência** e *ack* explícito. Escalar *bridge* para fluxo contínuo quando a latência for requisito. |
| **Modelo de dados mínimo (PostgreSQL)** | **`instruments`:** `id`, `symbol_internal`, `symbol_mt5` (ou nulo se não-MT5), `venue`/`connector_id`, metadados de mercado. **`ohlc_bars`:** `instrument_id`, `timeframe`, `ts_open` (UTC), `open`, `high`, `low`, `close`, `volume` (opcional), `source`, `quality_flag`. **`connector_health`:** por fonte, último *heartbeat*, latência, estado (`operational` / `degraded` / `unavailable`). **`order_intents` / `executions`:** trilha de intenção (demo/produção), referência externa MT5 (*deal/order id*), estado, correlação com decisão/risco (liga ao domínio de auditoria já previsto). |
| **Consequências** | Novo código apenas em `apps/api/src/connectors/` (+ opcional serviço Windows/*sidecar* não versionado no mesmo repo, documentado). Retenção de OHLC configurável; *ticks* completos **fora** do MVP salvo necessidade explícita. **Segurança:** credenciais MT5 e caminhos de rede **nunca** no cliente web. |

### ADR-002 — Visão: orquestração LLM (ex. LangChain), MCP e coexistência com RL

| Campo | Conteúdo |
|-------|-----------|
| **Estado** | Proposta de evolução (alinhada à expectativa do *product owner*); **não** substitui o MVP descrito nas secções anteriores sem **rever escopo** (usar *correct course* / PRD se a Fase 1 crescer demais). |
| **Contexto** | Pretende-se um sistema em que **LLMs** e **assistentes** trabalhem em conjunto com **RL/políticas aprendidas**, com **agentes especializados** (risco, contexto de mercado, explicação, *planning*) e possível uso de **MCP** para capacidades tipo ferramentas. |
| **Princípio de arquitectura** | **Camadas separadas com contratos estáveis:** (1) **Motor quantitativo** — candidatos, scores, política RL versionada (`services/agent` + serviços na API); saídas **estruturadas** (JSON validado). (2) **Orquestrador cognitivo** — *framework* tipo **LangChain / LangGraph** (ou equivalente) que encadeia passos e chama **ferramentas**; **não** substitui o motor de risco nem envia ordens sem passar pelos *gates* já definidos no PRD. (3) **MCP** — exposto como **servidores de ferramentas** que encapsulam **APIs internas** (ler OHLC, limites de risco, estado da fonte, histórico de decisões), **não** como acesso directo e aberto a corretoras sem autenticação da instância. |
| **Papel do RL vs. LLM** | **RL (ou política treinada):** produz **sinais, rankings ou parâmetros** mensuráveis e reprodutíveis; treino/avaliação em **paper/demo**. **LLM/orquestrador:** **interpretação, síntese, diálogo, *routing*** entre especialistas; **explica** conflitos de janela e alinhamento ao plano; **não** é a única fonte de verdade para números críticos (tamanho, P&L, limites) — esses vêm de serviços determinísticos. |
| **Encaixe no código** | Fase inicial: manter **`AssistantService`** na API com implementação **regras/templates**. Fase evolução: **`AssistantOrchestrator`** (módulo dedicado) que chama LangGraph/LangChain **no servidor**; *tools* implementadas como funções que batem na mesma API/serviços (padrão **function calling**). Servidores **MCP** podem viver em `services/mcp-*` ou processo colado à API, com **auth** de instância e *rate limit*. |
| **Riscos e mitigação** | **Complexidade e custo** (tokens, latência); **compliance narrativa** (evitar “garantia de lucro”); **segurança** (MCP não expõe segredos ao modelo). Mitigação: *feature flags*, métricas de latência, *logging* de traço de orquestração, **demo-first**, e revisão formal de escopo se o MVP for afectado. |
| **Decisão** | **Aceitar a visão** como **roadmap arquitetural**; **implementação incremental** após núcleo **cockpit + risco + trilha + conetor MT5 (ADR-001)** estável. Qualquer alteração aos entregáveis da Fase 1 deve passar por **correct course** no *sprint* / PRD. |

---

## Conclusão do fluxo

Documento de arquitetura **completo** para o **tradesystem**, alinhado ao PRD, ao *product brief* e à especificação de UX. Próximo passo sugerido: histórias de implementação ou *epics* derivados desta estrutura; em caso de dúvida sobre o que fazer a seguir no BMAD, usar a skill **bmad-help**.

---

## Changelog da arquitetura

Registo **cronológico inverso** (mais recente primeiro) de alterações a **este ficheiro** ou ao **desenho efectivo** do repositório. **Não substitui os ADRs** acima; serve para rastrear evolução incremental e *correct course*.

**Como usar:** quando fechar uma decisão estrutural ou actualizar o mapa de pastas, acrescentar uma linha no topo da tabela com data ISO (AAAA-MM-DD) e descrição curta.

| Data | Alteração |
|------|-----------|
| 2026-04-05 | Sincronização da árvore **Project Structure** com o código: `apps/web` com `app/`, `domains/<contexto>/`, `shared/`; `apps/api` com `composition/`, `services/<domínio>/` + `ports.ts`, `repositories/`, `plugins/` (incl. CSRF), `shared/` para utilitários sem domínio. **Frontend:** escolha fechada **React Router v7+**. **Gap analysis:** item Router marcado como resolvido. **Implementation Handoff:** referência à regra `.cursor/rules/tradesystem-modular-solid.mdc` e parágrafo de estado do repositório. |
| 2026-04-05 | Introdução da regra Cursor **tradesystem-modular-solid** (modularização, limites de domínio, SOLID) e reorganização inicial do monorepo nesse sentido (identidade, HTTP *stack*, cliente API da SPA). |
| 2026-04-05 | Documento de arquitectura marcado como completo (*step-08-complete*); ADR-001 (MT5) aceite; ADR-002 (LLM/MCP/RL) como roadmap; validação de prontidão para implementação. |
