---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: epics
project_name: tradesystem
status: complete
completedAt: "2026-04-05"
---

# tradesystem — Épicos e histórias

## Overview

Este documento decompõe o PRD, a arquitetura (incluindo ADR-001 MT5 e ADR-002 visão LLM/MCP/RL) e a especificação de UX em **épicos orientados a valor** e **histórias** com critérios de aceitação testáveis, prontas para implementação incremental.

**Documentos de entrada:** `prd.md`, `architecture.md`, `ux-design-specification.md`.

---

## Requirements Inventory

### Functional Requirements

```
FR1: O utilizador pode definir, editar e remover ativos na lista monitorizada.
FR2: O utilizador pode visualizar, num cockpit, o estado resumido de cada ativo monitorizado.
FR3: O sistema pode atualizar a visão dos ativos com informação de mercado disponível nas fontes configuradas.
FR4: O utilizador pode organizar ou filtrar a lista por critérios compatíveis com o MVP (ex.: mercado, prioridade).
FR5: O sistema pode identificar e apresentar oportunidades candidatas para ativos monitorizados.
FR6: O utilizador pode ver, para cada candidatura, o timeframe e o horizonte (dia, semana ou mês) associados ou sugeridos.
FR7: O utilizador pode filtrar ou ordenar candidaturas por combinação de timeframe e horizonte.
FR8: O sistema pode registar a janela de operação considerada em cada análise ou decisão.
FR9: O assistente pode explicar a tese da oportunidade no contexto da janela selecionada pelo utilizador.
FR10: O assistente pode sinalizar conflitos entre sinais ou contextos de curto prazo e de horizonte mais longo para o mesmo ativo.
FR11: O assistente pode relacionar a oportunidade com os limites de risco e o plano do utilizador quando essa informação estiver definida.
FR12: O utilizador pode interagir com o assistente no formato suportado pelo produto (estruturado e/ou conversacional, conforme implementação).
FR13: O utilizador pode configurar limites de risco (ex.: tamanho de posição, perda diária, concentração).
FR14: O sistema pode calcular ou exibir a aderência de uma decisão proposta aos limites configurados.
FR15: O sistema pode bloquear uma decisão que viole limites ou exigir confirmação explícita com registo de exceção, conforme regras configuradas.
FR16: O utilizador pode consultar o estado dos limites antes e depois de uma decisão.
FR17: O utilizador pode submeter intenções de execução compatíveis com o conetor disponível (incluindo modo demonstração).
FR18: O utilizador pode identificar claramente quando as ações ocorrem em modo demonstração face a modo de produção, quando este último estiver disponível.
FR19: O sistema pode impedir a execução em produção quando os critérios acordados para desbloqueio não forem cumpridos.
FR20: O utilizador pode registar a decisão final de operar ou não operar, com racional estruturado.
FR21: O agente pode influenciar ou classificar candidaturas segundo uma política versionada e registada.
FR22: O utilizador pode executar ou solicitar ciclos de treino e avaliação do agente em ambiente de paper ou demonstração.
FR23: O sistema pode armazenar métricas e artefactos de experimentos de forma associável a uma versão de política e a conjuntos de dados utilizados.
FR24: O utilizador pode comparar desempenho entre versões ou experimentos segundo indicadores definidos no produto.
FR25: O sistema pode ingerir dados de mercado a partir de fontes configuradas pelo utilizador ou pelo administrador da instância.
FR26: O utilizador pode ver o estado de cada fonte (operacional, degradada ou indisponível).
FR27: O sistema pode deixar de emitir ou marcar como incertas as candidaturas quando a qualidade ou a atualidade dos dados for insuficiente.
FR28: O utilizador pode receber na interface atualizações relevantes em tempo quase real, quando suportado pelas fontes.
FR29: O sistema pode manter trilha auditável de decisões e eventos de execução com identificação temporal e de janela de operação.
FR30: O utilizador pode consultar histórico de decisões e racional associado.
FR31: O utilizador pode consultar agregados ou vistas de desempenho alinhadas aos critérios de sucesso definidos para o produto.
FR32: O sistema pode apresentar avisos explícitos sobre incerteza e ausência de garantia de resultado financeiro, onde aplicável ao produto.
FR33: O utilizador pode autenticar-se para aceder ao cockpit.
FR34: O sistema pode armazenar e utilizar credenciais de integração sem as expor na interface ou em artefactos de código versionados.
FR35: O utilizador pode configurar parâmetros do sistema relevantes para o MVP (mercados suportados, fontes, modos e limites), dentro do desenho da instância.
FR36: O utilizador pode correlacionar ou reportar incidentes com identificadores de pedido ou de evento fornecidos pelo sistema para apoio à resolução.
```

### NonFunctional Requirements

```
NFR-P1: Interação na UI — ações principais do cockpit (abrir candidato, filtrar por janela) em menos de 200 ms percetíveis com dados em cache/sessão.
NFR-P2: Interface não bloqueia sob rajadas; atualização incremental e backpressure.
NFR-P3: Tempo até primeiro ecrã útil pós-login aceitável em rede doméstica (baseline documentado).
NFR-S1: Tráfego cliente-servidor em TLS com boas práticas atuais.
NFR-S2: Credenciais de integração em mecanismo de segredos; nunca no repositório nem expostas ao cliente.
NFR-S3: Sessão com expiração; proteção razoável a CSRF em mutações.
NFR-S4: Menor privilégio nas chaves dos conetores.
NFR-S5: Dados sensíveis em repouso encriptados ou equivalente do hosting, documentado.
NFR-A1: WCAG 2.1 nível AA nos fluxos críticos (login, navegação principal, risco, decisão).
NFR-A2: Checklist automatizada + teste manual dos percursos críticos antes do MVP.
NFR-I1: Falhas de fontes visíveis na UI em menos de 30 s após deteção (ou intervalo documentado).
NFR-I2: Timeout, retentativas e circuit breaker (ou equivalente) nos conetores, documentados.
NFR-I3: Identificador de correlação comum entre camadas.
NFR-I4: Conetores testáveis com fixtures/sandbox quando existir.
```

### Additional Requirements

```
- Monorepo com pnpm workspaces: `apps/web` (Vite + React + TypeScript), `apps/api` (Fastify), `packages/shared` (Zod/schemas).
- PostgreSQL + Drizzle ORM com migrações versionadas; naming DB snake_case, JSON API camelCase.
- REST versionada `/api/v1/*`; OpenAPI gerada a partir da API.
- WebSocket com envelope `{ type, payload, ts }`; eventos em dot.lower (ex.: market.tick, source.health).
- Serviço Python opcional (FastAPI) para pipeline RL/agente; contrato JSON estável com a API.
- ADR-001: conetor MT5 via interface MarketDataProvider/ExecutionProvider; modelo mínimo instruments, ohlc_bars, connector_health, order_intents/executions; híbrido batch + bridge conforme fase.
- ADR-002: evolução LLM/LangChain/MCP — incremental após núcleo estável; AssistantService como fachada.
- Docker Compose para dev (Postgres; opcional Redis posterior).
- Demo-first; gates explícitos para produção.
```

### UX Design Requirements

```
UX-DR1: Implementar tokens de cor do tema cockpit (fundo, superfície, acento, semântica conflito vs erro) conforme fundação visual da UX.
UX-DR2: Tipografia: família UI legível + monoespaçada para preços/códigos; escala modular documentada.
UX-DR3: Componente Cartão de candidato com estados normal, hover, selecionado, degradado, disabled; foco teclado e aria-label com ativo+janela+estado.
UX-DR4: Chip de janela (timeframe + horizonte) com variantes alinhado / neutro / conflito.
UX-DR5: Painel de conflito entre janelas (duas colunas: curto prazo vs horizonte longo) com severidade.
UX-DR6: Barra de modo demo/produção sempre visível em áreas de execução; produção com confirmação forte.
UX-DR7: Indicador de saúde da fonte (operacional / degradada / indisponível) na lista ou detalhe.
UX-DR8: Formulário de racional de decisão estruturado (motivo, tags opcionais, nota breve).
UX-DR9: Layout cockpit três colunas em desktop ≥1024px; tablet assistente em drawer; mobile coluna única com prioridades definidas na UX.
UX-DR10: Cliente WebSocket com reconnect exponencial; agregação/backpressure de ticks para não congelar UI (NFR-P2).
UX-DR11: Skeletons em listas; empty states com próxima ação (ex.: adicionar ativo).
UX-DR12: Erros de API com requestId copiável no fluxo de diagnóstico/definições.
UX-DR13: Conformidade WCAG 2.1 AA em login, navegação principal, formulários de risco e decisão (foco, contraste, nomes acessíveis).
UX-DR14: Padrão de copy e UI para aviso de incerteza e ausência de garantia de resultado (FR32).
UX-DR15: Cobertura e2e mínima dos percursos: jornada feliz, conflito+bloqueio risco, falha/degradação de dados.
```

### FR Coverage Map

| FR | Épico | Nota |
|----|-------|------|
| FR1–FR4 | Épico 3 | Carteira e cockpit |
| FR5–FR8 | Épico 3 | Oportunidades e janela |
| FR9–FR12 | Épico 6 | Assistente |
| FR13–FR16 | Épico 4 | Risco |
| FR17–FR20 | Épico 5 | Execução e decisão |
| FR21–FR24 | Épico 7 | Agente e experimentos |
| FR25–FR28 | Épico 2 | Dados e tempo real |
| FR29–FR32 | Épico 5 | Auditoria e transparência |
| FR33–FR36 | Épicos 1, 2, 5 | Auth, segredos, settings distribuídos, correlação |

---

## Epic List

### Épico 1: Fundação técnica e acesso autenticado ao produto
O utilizador autentica-se de forma segura e acede a um *shell* da aplicação pronto para evoluir para o cockpit.  
**FRs:** FR33, FR36 (correlação). **NFRs:** NFR-S1, NFR-S3, NFR-I3.

### Épico 2: Fontes de mercado, ingestão e tempo quase real
O sistema ingere dados de fontes configuráveis, expõe saúde das fontes e atualiza a UI em tempo quase real.  
**FRs:** FR25–FR28, FR34, FR35 (fontes). **NFRs:** NFR-I1, NFR-I2, NFR-I4. **ADR-001** modelo mínimo.

### Épico 3: Cockpit, lista monitorizada e oportunidades com janela de operação
O utilizador gere a *watchlist*, vê o estado dos ativos e trabalha candidatos com timeframe e horizonte explícitos.  
**FRs:** FR1–FR8. **UX:** UX-DR3, UX-DR4, UX-DR7, UX-DR9, UX-DR11, NFR-P1.

### Épico 4: Gestão de risco configurável no fluxo de decisão
O utilizador define limites, vê aderência e enfrenta bloqueio ou fluxo de exceção documentado.  
**FRs:** FR13–FR16, FR35 (limites). **UX:** UX-DR13 (formulários risco). **NFR-P1.**

### Épico 5: Execução em demo, registo de decisão e trilha auditável
O utilizador executa em demo, regista racional, consulta histórico e métricas básicas, com transparência e modo explícito.  
**FRs:** FR17–FR20, FR29–FR32, FR35 (modos), FR36 (erros UI). **UX:** UX-DR6, UX-DR8, UX-DR12, UX-DR14, UX-DR15.

### Épico 6: Assistente de decisão contextual
O assistente explica a tese da janela, conflitos e ligação ao risco/plano, com UI dedicada.  
**FRs:** FR9–FR12. **UX:** UX-DR5.

### Épico 7: Agente versionado, experimentos em paper e comparação de desempenho
Política versionada influencia candidatos; treino/avaliação em paper; métricas e comparação de versões.  
**FRs:** FR21–FR24. **ADR-002** evolução futura LLM não bloqueia entrega das histórias base.

---

## Épico 1: Fundação técnica e acesso autenticado ao produto

Permitir que Eder arranque o monorepo, a API e a SPA, com login e identificação de pedidos para suporte e observabilidade.

### Story 1.1: Monorepo, starter Vite/React e API Fastify com PostgreSQL

Como **Eder**,  
quero **repositório com `apps/web`, `apps/api`, Postgres em Docker Compose e Drizzle inicializado**,  
para **ter base alinhada à arquitetura e poder desenvolver funcionalidades sobre ela**.

**Acceptance Criteria:**

**Given** máquina de desenvolvimento com Node LTS e pnpm instalados  
**When** executo os comandos documentados no README da raiz (install, compose up, migrações)  
**Then** `apps/web` inicia com Vite e `apps/api` responde em healthcheck HTTP  
**And** PostgreSQL está acessível à API e existe pelo menos uma migração Drizzle aplicada (ex.: tabela de utilizador ou metadados mínimos)

---

### Story 1.2: Autenticação de sessão para aceder ao cockpit

Como **Eder**,  
quero **iniciar e terminar sessão com credenciais da instância**,  
para **cumprir FR33 e proteger o cockpit**.

**Acceptance Criteria:**

**Given** utilizador registado ou *seed* de utilizador único na instância  
**When** submeto login válido  
**Then** recebo sessão segura (cookie httpOnly conforme arquitetura) e sou redireccionado para a área autenticada  
**When** termino sessão  
**Then** o cookie é invalidado e não consigo aceder a rotas protegidas sem novo login  
**And** política de expiração de sessão está documentada (NFR-S3)

---

### Story 1.3: Identificador de correlação em pedidos e respostas de erro

Como **Eder**,  
quero **que cada pedido relevante tenha um requestId visível em erros**,  
para **cumprir FR36 e NFR-I3**.

**Acceptance Criteria:**

**Given** um pedido à API  
**When** ocorre erro 4xx/5xx  
**Then** a resposta JSON inclui `requestId` (ou campo equivalente documentado) alinhado aos logs do servidor  
**And** o cliente pode exibir ou copiar esse id (detalhe UX completo no Épico 5 — aqui mínimo em JSON + log)

---

### Story 1.4: Protecção CSRF e CORS em mutações da API

Como **Eder**,  
quero **mutações protegidas contra CSRF com CORS explícito**,  
para **alinhamento com NFR-S3 em ambiente web**.

**Acceptance Criteria:**

**Given** SPA em origem permitida na configuração da API  
**When** executo uma mutação autenticada (POST/PUT/PATCH/DELETE)  
**Then** o pedido é validado conforme estratégia escolhida (token CSRF ou *SameSite*+origem documentada)  
**And** pedidos de origens não permitidas são rejeitados

---

### Story 1.5: Shell da SPA com rotas login e cockpit (placeholder)

Como **Eder**,  
quero **navegação básica entre login e cockpit vazio**,  
para **ter o esqueleto onde os épicos seguintes encaixam (UX-DR11 *empty state*)**.

**Acceptance Criteria:**

**Given** utilizador autenticado  
**When** acedo à rota cockpit  
**Then** vejo *empty state* orientador (ex.: “Adicionar ativo” ou “Configurar fonte”) sem erros de consola  
**Given** não autenticado  
**When** tento aceder ao cockpit  
**Then** sou redireccionado para login

---

## Épico 2: Fontes de mercado, ingestão e tempo quase real

### Story 2.1: Esquema mínimo de instrumentos, barras OHLC e saúde de fontes

Como **Eder**,  
quero **tabelas alinhadas à ADR-001 para instrumentos, ohlc_bars e connector_health**,  
para **persistir dados de mercado de forma normalizada**.

**Acceptance Criteria:**

**Given** migrações Drizzle  
**When** aplico migrações  
**Then** existem tabelas com chaves e timestamps UTC documentados (instrument_id, timeframe, ts_open, quality_flag, etc.)  
**And** `connector_health` suporta estados operacional/degradada/indisponível (FR26)

---

### Story 2.2: Interface MarketDataProvider e implementação mock configurável

Como **Eder**,  
quero **ingerir dados de uma fonte mock configurável**,  
para **cumprir FR25 e testar o pipeline sem MT5 real**.

**Acceptance Criteria:**

**Given** configuração de fonte mock na instância  
**When** o job ou endpoint de sincronização corre  
**Then** barras OHLC são gravadas para instrumentos de teste  
**And** falhas simuladas propagam estado degradado/indisponível (FR26, FR27)

---

### Story 2.3: API e UI de estado das fontes

Como **Eder**,  
quero **ver o estado de cada fonte no cockpit**,  
para **FR26 e UX-DR7**.

**Acceptance Criteria:**

**Given** pelo menos uma fonte configurada  
**When** abro o cockpit ou painel de estado  
**Then** vejo indicador operacional/degradada/indisponível por fonte ou ativo afetado  
**And** mudança de estado para degradado torna-se visível no UI dentro do alvo NFR-I1 (30s ou documentado)

---

### Story 2.4: Canal WebSocket para atualizações de mercado

Como **Eder**,  
quero **receber atualizações em tempo quase real na interface**,  
para **FR28, UX-DR10 e NFR-P2**.

**Acceptance Criteria:**

**Given** sessão autenticada e subscrição a símbolos  
**When** a API publica evento `market.tick` ou agregado equivalente  
**Then** o cliente recebe mensagens no envelope `{ type, payload, ts }`  
**And** reconexão automática após queda é implementada (backoff)  
**And** sob rajada, a UI aplica estratégia de agregação/*throttle* documentada para não bloquear (NFR-P2)

---

### Story 2.5: Política de degradação de candidatos quando dados são maus

Como **Eder**,  
quero **que candidatos não sejam apresentados como certos com dados inválidos/atrasados**,  
para **FR27**.

**Acceptance Criteria:**

**Given** fonte em estado degradado ou dados fora de limiar de atualidade  
**When** o motor de oportunidades corre  
**Then** candidatos são suprimidos ou marcados como incertos conforme regra configurável  
**And** o motivo é registado para auditoria técnica (*logs*)

---

### Story 2.6: Armazenamento seguro de credenciais de integração

Como **Eder**,  
quero **guardar credenciais de fontes/conetores sem aparecerem na UI nem no git**,  
para **FR34 e NFR-S2/S5**.

**Acceptance Criteria:**

**Given** formulário de configuração de fonte no servidor  
**When** guardo credenciais  
**Then** são persistidas encriptadas ou via segredo do ambiente conforme documentação  
**And** nunca são devolvidas em texto claro à API de leitura para o cliente  
**And** `.env.example` lista apenas chaves necessárias, sem valores secretos

---

## Épico 3: Cockpit, lista monitorizada e oportunidades com janela de operação

### Story 3.1: CRUD da lista monitorizada

Como **Eder**,  
quero **adicionar, editar e remover ativos da watchlist**,  
para **FR1**.

**Acceptance Criteria:**

**Given** cockpit autenticado  
**When** adiciono um instrumento válido do catálogo interno  
**Then** aparece na lista persistida após refresh  
**When** edito ou removo  
**Then** as alterações reflectem-se na API e na UI

---

### Story 3.2: Vista resumida do estado por ativo e filtros básicos

Como **Eder**,  
quero **ver estado resumido e filtrar por mercado/prioridade**,  
para **FR2, FR4**.

**Acceptance Criteria:**

**Given** watchlist com vários ativos  
**When** abro o cockpit  
**Then** cada linha mostra resumo (preço/alteração ou placeholder alimentado por dados disponíveis)  
**When** aplico filtro por mercado ou prioridade  
**Then** a lista actualiza em menos de 200 ms com dados já em cache (NFR-P1)

---

### Story 3.3: Motor de oportunidades candidatas e registo de janela

Como **Eder**,  
quero **ver oportunidades geradas para os meus ativos com janela registada**,  
para **FR5, FR8**.

**Acceptance Criteria:**

**Given** dados de mercado disponíveis (mock ou real)  
**When** o motor corre  
**Then** candidatos são listados com referência ao instrumento  
**And** cada candidatura persiste ou expõe `timeframe` e `horizonte` (FR6 base)  
**And** ao seleccionar para análise, a janela considerada fica associada ao contexto de decisão (FR8)

---

### Story 3.4: Detalhe do candidato com timeframe e horizonte explícitos

Como **Eder**,  
quero **painel de detalhe com TF e horizonte visíveis**,  
para **FR6 e UX-DR3/UX-DR4**.

**Acceptance Criteria:**

**Given** candidato seleccionado  
**When** abro o detalhe  
**Then** timeframe e horizonte são mostrados em chips ou equivalente (UX-DR4)  
**And** cartão/lista segue estados visuais definidos (UX-DR3)

---

### Story 3.5: Filtrar e ordenar candidatos por janela

Como **Eder**,  
quero **filtrar/ordenar por combinação de timeframe e horizonte**,  
para **FR7**.

**Acceptance Criteria:**

**Given** múltiplos candidatos  
**When** selecciono filtro M15 + horizonte dia (exemplo)  
**Then** só vejo candidatos correspondentes  
**When** ordeno por prioridade ou tempo  
**Then** a ordem é estável e testável

---

### Story 3.6: Layout cockpit três colunas (desktop) com degradação responsiva

Como **Eder**,  
quero **layout recomendado pela UX em desktop e uso legível em tablet/mobile**,  
para **UX-DR9**.

**Acceptance Criteria:**

**Given** viewport ≥ 1024px  
**When** abro o cockpit com candidato seleccionado  
**Then** lista | detalhe | assistente (ou placeholder do assistente) coexistem sem sobreposição crítica  
**Given** viewport inferior a 768px  
**When** uso o cockpit  
**Then** prioridade é lista + alertas conforme UX spec

---

## Épico 4: Gestão de risco configurável no fluxo de decisão

### Story 4.1: Configuração de limites de risco

Como **Eder**,  
quero **definir limites (posição, perda diária, concentração, etc.)**,  
para **FR13, FR35**.

**Acceptance Criteria:**

**Given** área de definições de risco  
**When** introduzo valores válidos  
**Then** são persistidos e validados (tipos, mínimos/máximos)  
**And** labels e erros são acessíveis (UX-DR13)

---

### Story 4.2: Cálculo e visualização de aderência pré-decisão

Como **Eder**,  
quero **ver se uma intenção respeita os limites antes de confirmar**,  
para **FR14, FR16**.

**Acceptance Criteria:**

**Given** limites configurados e proposta de tamanho/preço  
**When** solicito pré-visualização de aderência  
**Then** o sistema indica OK vs violação por limite  
**And** posso ver estado dos limites antes e depois da simulação (FR16)

---

### Story 4.3: Bloqueio ou confirmação de exceção com registo

Como **Eder**,  
quero **ser bloqueado ou forçado a confirmar exceção quando violo regras**,  
para **FR15**.

**Acceptance Criteria:**

**Given** decisão que viola limite  
**When** tento avançar  
**Then** o sistema bloqueia OU exige confirmação explícita com motivo de exceção registado  
**And** o evento fica na trilha auditável (ligação ao Épico 5)

---

## Épico 5: Execução em demo, registo de decisão e trilha auditável

### Story 5.1: Intenção de execução em modo demonstração

Como **Eder**,  
quero **submeter ordem simulada via conetor demo**,  
para **FR17**.

**Acceptance Criteria:**

**Given** modo demo activo e conetor demo/stub  
**When** confirmo intenção compatível  
**Then** registo de intenção e resposta do conetor é guardado sem executar produção  
**And** política de idempotência documentada se aplicável

---

### Story 5.2: Distinção visual e lógica demo vs produção + gate de produção

Como **Eder**,  
quero **saber sempre em que modo estou e não operar em produção sem critérios**,  
para **FR18, FR19, UX-DR6**.

**Acceptance Criteria:**

**Given** interface de execução  
**When** estou em demo  
**Then** barra ou *badge* persistente indica DEMO (UX-DR6)  
**When** produção está bloqueada por gates  
**Then** não consigo submeter ordem real e vejo mensagem com critérios pendentes (FR19)

---

### Story 5.3: Registo de decisão com racional estruturado

Como **Eder**,  
quero **registar operar / não operar com racional**,  
para **FR20 e UX-DR8**.

**Acceptance Criteria:**

**Given** fluxo pós-análise  
**When** escolho decisão e preencho campos mínimos do racional  
**Then** registo é persistido e associado à janela e ao candidato  
**And** validação impede submissão vazia onde o PRD exige estrutura mínima

---

### Story 5.4: Trilha auditável de decisões e execuções

Como **Eder**,  
quero **trilha com tempo e janela de operação**,  
para **FR29**.

**Acceptance Criteria:**

**Given** decisão ou execução  
**When** consulto evento na trilha  
**Then** registo inclui timestamp UTC, utilizador, janela (TF+horizonte), modo demo/prod, ids de correlação relevantes

---

### Story 5.5: Histórico consultável de decisões e racional

Como **Eder**,  
quero **listar decisões passadas com racional**,  
para **FR30**.

**Acceptance Criteria:**

**Given** decisões registadas  
**When** abro histórico  
**Then** posso filtrar por ativo/data e abrir detalhe com racional

---

### Story 5.6: Vistas básicas de desempenho / agregados

Como **Eder**,  
quero **ver agregados alinhados aos critérios do produto (ex.: contagem, aderência, métricas demo)**,  
para **FR31** (MVP simples).

**Acceptance Criteria:**

**Given** dados de decisões e execuções demo  
**When** abro painel de métricas MVP  
**Then** vejo pelo menos um agregado útil (ex.: taxa de aderência ao plano ou contagem de decisões por tipo) documentado

---

### Story 5.7: Avisos de incerteza e ausência de garantia

Como **Eder**,  
quero **avisos explícitos onde o produto não garante resultado financeiro**,  
para **FR32 e UX-DR14**.

**Acceptance Criteria:**

**Given** fluxos de análise e execução  
**When** utilizo funcionalidades de sinal/assistente  
**Then** copy e componente de aviso aparecem conforme UX spec  
**And** passam verificação manual de contraste/leitura (UX-DR13 onde aplicável)

---

### Story 5.8: Superfície de erro com requestId copiável

Como **Eder**,  
quero **copiar requestId quando algo falha**,  
para **FR36 e UX-DR12**.

**Acceptance Criteria:**

**Given** erro de API com requestId  
**When** abro detalhe de erro ou toast estendido  
**Then** posso copiar o id para diagnóstico

---

### Story 5.9: Testes e2e dos três percursos críticos

Como **Eder**,  
quero **testes automatizados dos fluxos feliz, conflito+risco e dados degradados**,  
para **UX-DR15 e confiança de release**.

**Acceptance Criteria:**

**Given** pipeline CI ou comando local  
**When** executo suíte e2e  
**Then** três cenários mínimos passam (definidos em linguagem de teste: happy path decisão demo, bloqueio/exceção, fonte degradada visível)

---

## Épico 6: Assistente de decisão contextual

### Story 6.1: Explicação da tese da oportunidade na janela (AssistantService regras)

Como **Eder**,  
quero **explicação estruturada da tese no contexto da janela seleccionada**,  
para **FR9**.

**Acceptance Criteria:**

**Given** candidato e janela seleccionados  
**When** solicito parecer do assistente  
**Then** recebo secções estáveis (ex.: resumo, fatores, incerteza) geradas por regras/templates ou serviço configurável  
**And** o contrato JSON é versionável sem mudar a UI

---

### Story 6.2: Deteção e apresentação de conflito entre janelas

Como **Eder**,  
quero **ver conflito explícito entre curto e longo prazo**,  
para **FR10 e UX-DR5**.

**Acceptance Criteria:**

**Given** sinais divergentes simulados entre horizontes  
**When** abro assistente  
**Then** painel de conflito mostra duas colunas com narrativa curta e severidade

---

### Story 6.3: Relação com limites de risco e plano

Como **Eder**,  
quero **o assistente a relacionar oportunidade com limites e plano quando existirem**,  
para **FR11**.

**Acceptance Criteria:**

**Given** limites configurados (Épico 4)  
**When** peço parecer  
**Then** o texto ou blocos referem aderência ou espaço até ao limite (dados vindos da API, não inventados pelo cliente)

---

### Story 6.4: UI de interacção estruturada (e extensível a conversacional)

Como **Eder**,  
quero **interagir com o assistente no formato suportado (painel + possível chat)**,  
para **FR12**.

**Acceptance Criteria:**

**Given** painel do assistente na terceira coluna ou drawer  
**When** refresco contexto ao mudar candidato  
**Then** o conteúdo actualiza sem perder estado de sessão irrelevante  
**And** se chat existir, mensagens incluem *disclaimer* e não substituem checks de risco

---

## Épico 7: Agente versionado, experimentos em paper e comparação de desempenho

### Story 7.1: Política versionada que influencia ranking de candidatos

Como **Eder**,  
quero **classificar candidatos com política registada e versionada**,  
para **FR21**.

**Acceptance Criteria:**

**Given** política v1 aplicada  
**When** listo candidatos  
**Then** ordenação ou *score* reflecte a política e a versão fica em metadados consultáveis

---

### Story 7.2: Jobs de treino e avaliação em paper/demo

Como **Eder**,  
quero **disparar ciclo de treino/avaliação apenas em ambiente paper/demo**,  
para **FR22**.

**Acceptance Criteria:**

**Given** configuração paper  
**When** solicito treino  
**Then** job corre isoladamente da produção e estado é visível (queued/running/failed/success)

---

### Story 7.3: Persistência de métricas e artefactos de experimentos

Como **Eder**,  
quero **métricas e artefactos ligados a versão de política e dataset**,  
para **FR23**.

**Acceptance Criteria:**

**Given** execução de experimento concluída  
**When** consulto registo  
**Then** vejo versão política, *hash* ou id de dataset, métricas principais e caminho seguro ao artefacto (armazenamento conforme arquitetura)

---

### Story 7.4: Comparar versões ou experimentos na UI

Como **Eder**,  
quero **comparar indicadores entre corridas**,  
para **FR24**.

**Acceptance Criteria:**

**Given** pelo menos dois experimentos  
**When** abro comparador MVP  
**Then** vejo tabela ou cartões lado a lado com métricas definidas (ex.: profit factor proxy em demo, drawdown simulado, etc.) documentadas no produto

---

## Validação final (passo 4)

| Verificação | Resultado |
|-------------|-----------|
| Cobertura FR1–FR36 | Cada FR mapeado no mapa e endereçado em pelo menos uma história ou critério. |
| Starter / fundação | História 1.1 cobre monorepo Vite + Fastify + Postgres + Drizzle conforme arquitetura. |
| Tabelas incrementais | Esquemas aparecem nas histórias que os necessitam (2.1, não tudo na 1.1). |
| Dependências entre histórias | Ordem numérica dentro de cada épico; épicos posteriores assumem anteriores — cada épico entrega valor próprio. |
| UX-DR | UX-DR1–2 embutidos em decisões de UI nas histórias 3.x/5.x; DR3–15 cobertos nas histórias indicadas. |
| NFR | P1/P2 em 3.x e 2.4; segurança em 1.x, 2.6; integração em 2.x; acessibilidade em 4.x, 5.x, 6.x; e2e em 5.9. |

**Workflow:** concluído. Para próximos passos no BMAD, usar **bmad-help** ou **check implementation readiness** quando existir alinhamento final entre artefactos.
