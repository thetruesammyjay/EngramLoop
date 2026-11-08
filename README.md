# EngramLoop

**Self-learning AI agents with persistent, explainable memory.**

[![Status](https://img.shields.io/badge/status-initial%20scaffold-2563eb)](#project-status) [![Python](https://img.shields.io/badge/Python-3.12%2B-3776AB?logo=python&logoColor=white)](#technology-stack) [![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?logo=fastapi&logoColor=white)](#technology-stack) [![Next.js](https://img.shields.io/badge/Next.js-dashboard-black?logo=nextdotjs)](#technology-stack)

## Project status

> **Project status — initial scaffold.** The repository now contains a starter FastAPI service, a Next.js dashboard, database and worker scaffolding, local infrastructure, and CI workflows. Provider setup, automated tests, evaluation, production privacy controls, and several planned features still need implementation. The included concept image is illustrative.

The scaffold provides a user-scoped API and database model, an OpenAI-backed streaming chat graph, background memory extraction, memory CRUD, and a dashboard that shows preview content until Clerk and the API are configured. It is an early foundation, not a production-ready release.

![EngramLoop concept: conversation to persistent memory](docs/assets/concept.png)

**Author:** [Ifiezibe Samuel / @thetruesammyjay](https://github.com/thetruesammyjay)  
**Repository:** `https://github.com/thetruesammyjay/EngramLoop`  
**Focus:** Agentic AI · memory systems · retrieval · backend engineering

## Table of contents

- [Overview](#overview)
- [Problem statement](#problem-statement)
- [Goals and non-goals](#goals-and-non-goals)
- [Target users and use cases](#target-users-and-use-cases)
- [How EngramLoop works](#how-engramloop-works)
- [Features and scope](#features-and-scope)
- [Technology stack](#technology-stack)
- [System architecture](#system-architecture)
- [Memory lifecycle and data model](#memory-lifecycle-and-data-model)
- [Proposed repository structure](#proposed-repository-structure)
- [API design](#api-design)
- [Local development](#local-development)
- [Security and privacy](#security-and-privacy)
- [Testing and evaluation](#testing-and-evaluation)
- [Delivery roadmap](#delivery-roadmap)
- [Engineering decisions and trade-offs](#engineering-decisions-and-trade-offs)
- [References and attribution](#references-and-attribution)

## Overview

EngramLoop explores a deceptively difficult question: **how can an AI assistant remember the right things across conversations without accumulating incorrect, stale, or private information?**

The system combines a conversational agent, an explicit memory-extraction pipeline, durable user-scoped storage, semantic retrieval, memory-quality checks, and a transparent dashboard. The scaffold wires an initial version of the chat, memory CRUD, retrieval, extraction queue, and dashboard paths. The agent uses memories to provide better continuity in later sessions; the user can inspect and manage what has been stored.

**Learning** here means improving the agent's *available context* through memory extraction, retrieval, and user feedback. It does **not** imply that LLM weights are automatically retrained after every message.

### Product value

- Remember preferences, recurring facts, project constraints, and unresolved tasks between chats.
- Retrieve only memories relevant to the current query, with traceability to their source.
- Detect potential contradictions and outdated information before using it.
- Give users control over stored memories, retention, and deletion.
- Measure whether memory actually improves answer relevance and consistency.

## Problem statement

Typical stateless chat systems treat a fresh conversation as a blank slate. Pasting full chat histories into every request is costly, slow, and noisy. Naïvely saving every message is not enough: facts can change, duplicate entries accumulate, sensitive data is over-retained, and irrelevant matches can worsen responses.

EngramLoop addresses five concrete problems:

1. **Continuity:** useful user context is lost between sessions.
2. **Selection:** large conversation histories make it hard to retrieve the *right* context.
3. **Quality:** stored memories can be duplicated, contradictory, or stale.
4. **Trust:** users need to understand, correct, and erase retained facts.
5. **Measurement:** memory features often lack evaluations demonstrating that they help.

## Goals and non-goals

| Goals for the first usable release | Explicitly out of scope for v1 |
|---|---|
| Working chat with cross-session persistent memories | Fine-tuning base-model weights on every conversation |
| User-scoped extraction, search, update, and deletion | Autonomous external actions or tool execution |
| Observable memory usage in each response | Multi-agent marketplace and third-party plugins |
| Minimal memory admin dashboard | Graph database and complex knowledge graphs |
| Measurable no-memory vs memory-enabled evaluation | Claims of guaranteed factual correctness |

## Target users and use cases

- **Developers** building assistants with persistent personalization.
- **Students and researchers** experimenting with RAG, memory decay, and retrieval quality.
- **Knowledge workers** needing continuity across multi-step conversations.

**Example:** A user explains their preferred Python tooling and a project architecture in one conversation. Later they ask for an implementation plan. EngramLoop recalls those *relevant* preferences, cites the memory sources internally, and avoids requiring the user to repeat them.

## How EngramLoop works

1. **Receive a message.** Authenticate the user and associate the message with a conversation/thread.
2. **Retrieve context.** Filter memories by owner, rank semantically relevant facts, and apply a token budget.
3. **Generate a response.** Provide the current message and selected memories to the LLM; stream the result.
4. **Extract candidates.** Inspect the new turn asynchronously for stable, useful facts and preferences.
5. **Validate and persist.** Deduplicate or flag conflicting memories, store provenance and timestamps, and update search embeddings.
6. **Improve through feedback.** Users correct/delete memories; evaluation compares quality before and after retrieval.

**Key separation:** LangGraph checkpoints are intended to keep **thread execution state**, while the long-term memory layer keeps **cross-thread user facts**. The scaffold currently stores recent message history in PostgreSQL and does not configure a LangGraph checkpointer yet; keep the two concerns separate as checkpointing is added.

## Features and scope

The table below defines the intended MVP scope. A checkmark indicates a v1 target, not a claim that the scaffold is complete.

| Feature | MVP | Later |
|---|:---:|:---:|
| User authentication and isolated workspaces | ✅ | |
| Streaming agent conversation | ✅ | |
| Memory extraction and semantic search | ✅ | |
| Long-term storage with source references | ✅ | |
| Read, edit, and delete memories | ✅ | |
| Memory relevance and usage logging | ✅ | |
| Contradiction review queue | | ✅ |
| Automatic expiration / retention controls | | ✅ |
| Cross-provider LLM configuration | | ✅ |
| Memory-aware benchmark suite and visual analytics | | ✅ |

## Technology stack

| Layer | Proposed technology | Responsibility |
|---|---|---|
| Language | Python 3.12+ | Backend and memory-engine logic |
| API | FastAPI + Pydantic | Typed REST, SSE streaming, OpenAPI |
| Agent workflow | LangGraph | Graph orchestration and checkpoints |
| Memory adapter | PostgreSQL repository selected through `MemoryProvider`; optional Mem0 bridge | User-scoped persistence, provenance, semantic retrieval |
| LLMs | OpenAI adapter in the scaffold; Anthropic later | Response generation / fact extraction |
| Embeddings | Provider API or Sentence Transformers | Semantic indexing and query vectors |
| Database | PostgreSQL + pgvector | Users, conversations, memory metadata, vectors |
| Database access | SQLAlchemy 2 + Alembic | Domain models and schema migrations |
| Cache and jobs | Redis + Dramatiq | Rate limiting, asynchronous extraction, retries |
| Authentication | Clerk on web + server-side JWT verification | Identity and tenant isolation |
| Web frontend | Next.js + React + TypeScript | Chat UI and memory management |
| UI | Tailwind CSS + shadcn/ui | Accessible interface components |
| Dependency management | uv (Python), pnpm (web) | Reproducible environments |
| Tests | pytest, pytest-asyncio, Playwright | Logic, API, integration, and E2E testing |
| Infrastructure | Docker Compose locally; Docker/VPS + Vercel later | Development and deployment |

**Implementation note:** Dependency ranges are resolved into `apps/api/uv.lock` and `pnpm-lock.yaml`. Routes and agent nodes select the PostgreSQL repository through `MemoryProvider`; the Mem0 bridge is optional and not wired as a replacement yet.

## System architecture

### High-level components

```mermaid
flowchart LR
    U[User] --> W[Next.js dashboard]
    W -->|Authenticated API calls| API[FastAPI]
    API --> G[LangGraph agent]
    G --> R[Memory retrieval + ranking]
    R --> V[(PostgreSQL + pgvector)]
    G --> L[LLM provider]
    L -->|Token stream| G
    G -->|Response| API
    API -->|SSE stream| W
    API -->|Completed turn event| Q[Redis job queue]
    Q --> X[Memory extraction worker]
    X --> D[Validate / deduplicate / redact]
    D --> M[Memory provider adapter]
    M --> V
    API --> C[(LangGraph checkpoints)]
```

### Request and memory-update sequence

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Web as Next.js
    participant API as FastAPI
    participant Store as Memory store
    participant Agent as LangGraph + LLM
    participant Worker as Extraction worker
    User->>Web: Send message
    Web->>API: POST /v1/chat/stream (JWT)
    API->>Store: Search relevant memories (user-scoped)
    Store-->>API: Ranked facts + provenance
    API->>Agent: Message + selected facts
    Agent-->>API: Stream response tokens
    API-->>Web: SSE events
    Web-->>User: Display answer
    API-->>Worker: Queue completed turn
    Worker->>Worker: Extract facts and redact sensitive content
    Worker->>Store: Deduplicate / store / version memory
    Store-->>Worker: Memory IDs
```

### Deployment boundaries

- **Web:** Vercel-hosted Next.js client; no provider secrets in browser bundles.
- **API:** Dockerized FastAPI service on a VPS with TLS termination.
- **Worker:** independent Docker process using the same Python codebase, connected to Redis.
- **Data:** PostgreSQL with pgvector; migrations run explicitly during deployment.
- **Secrets:** environment/secret manager only; never committed.
- **Observability:** structured logs, trace IDs, request latency, retrieval outcomes, and queue failures, excluding raw sensitive message content by default.

## Memory lifecycle and data model

### Memory states

`candidate → validated → active → superseded/deleted` (with `needs_review` for ambiguities).

**Types:** `preference`, `fact`, `project_context`, `instruction`, and `episodic_summary`. Different types can have different retention rules and retrieval weights.

### Representative relational schema

| Table | Important fields | Purpose |
|---|---|---|
| `users` | `id`, `external_auth_id`, `created_at` | User identity mapping |
| `conversations` | `id`, `user_id`, `title`, `created_at` | Thread ownership |
| `messages` | `id`, `conversation_id`, `role`, `content`, `created_at` | Conversation history |
| `memories` | `id`, `user_id`, `kind`, `content`, `embedding`, `state`, `version`, `created_at`, `updated_at` | Long-term facts and vectors |
| `memory_sources` | `memory_id`, `message_id`, `extraction_run_id` | Provenance and explainability |
| `memory_events` | `id`, `memory_id`, `action`, `previous_version`, `created_at` | Auditable changes |
| `feedback` | `id`, `user_id`, `message_id`, `rating`, `note` | Quality signals |

`embedding` dimensionality must match the configured embedding model. Every query must filter on the **authenticated** owner, not on an arbitrary user ID from the request body.

### Retrieval policy

1. Restrict candidates to user-owned, active memories.
2. Embed the query and perform vector similarity search.
3. Combine relevance, recency, category, confidence, and explicit user corrections.
4. Remove semantic duplicates; handle contradiction flags.
5. Respect a memory token budget and log selected IDs for audits.
6. Exclude deleted, expired, or non-consented sensitive details.

## Proposed repository structure

```text
EngramLoop/
├── README.md                         # This document
├── .env.example                      # Example non-secret environment variables
├── .gitignore
├── .github/
│   └── workflows/
│       ├── api-ci.yml                # Ruff, type-checks, pytest
│       └── web-ci.yml                # ESLint, typecheck, build, UI tests
├── apps/
│   ├── web/                          # Next.js dashboard
│   │   ├── app/
│   │   │   ├── (auth)/sign-in/        # Identity screens
│   │   │   ├── (workspace)/chat/      # Conversation UI
│   │   │   ├── (workspace)/memories/  # Memory list, details, edits
│   │   │   ├── (workspace)/settings/  # Retention/preferences
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── chat/                   # Composer, transcript, sources
│   │   │   ├── memories/              # Search, filters, edit dialogs
│   │   │   └── ui/                    # Shared shadcn components
│   │   ├── hooks/                      # SSE chat and data hooks
│   │   ├── lib/                        # API client, auth, types
│   │   ├── public/
│   │   └── package.json
│   └── api/                          # Python service + worker
│       ├── pyproject.toml
│       ├── uv.lock
│       ├── alembic.ini
│       ├── migrations/               # Alembic revisions
│       ├── src/engramloop/
│       │   ├── main.py               # FastAPI app factory / lifespan
│       │   ├── api/v1/
│       │   │   ├── chat.py           # Stream/create conversations
│       │   │   ├── memories.py       # Memory CRUD and search
│       │   │   ├── feedback.py       # User correction signals
│       │   │   └── health.py         # Liveness and readiness
│       │   ├── agents/
│       │   │   ├── graph.py          # LangGraph node connections
│       │   │   ├── state.py          # Typed graph state
│       │   │   └── nodes/            # Retrieve, reason, respond
│       │   ├── memory/
│       │   │   ├── contracts.py      # MemoryProvider protocol
│       │   │   ├── mem0_adapter.py   # Integration behind interface
│       │   │   ├── extraction.py     # Candidate detection
│       │   │   ├── retrieval.py      # Search / reranking
│       │   │   ├── consolidation.py  # Duplicate + conflict handling
│       │   │   └── privacy.py        # Redaction and TTL rules
│       │   ├── providers/            # LLM and embedding adapters
│       │   ├── db/
│       │   │   ├── models.py         # SQLAlchemy entities
│       │   │   ├── session.py
│       │   │   └── repositories/     # User-scoped persistence
│       │   ├── jobs/
│       │   │   ├── worker.py         # Dramatiq worker entrypoint
│       │   │   └── extract_turn.py   # Background extraction task
│       │   ├── schemas/              # Pydantic I/O types
│       │   ├── core/                 # Settings, auth, telemetry
│       │   └── evaluation/           # Memory-aware eval harness
│       └── tests/
│           ├── unit/
│           ├── integration/
│           └── fixtures/
├── infra/
│   ├── compose.yml                   # PostgreSQL/pgvector + Redis
│   ├── Dockerfile.api
│   ├── Dockerfile.worker
│   └── caddy/                         # Reverse proxy / HTTPS
├── docs/
│   ├── assets/concept.png            # Included concept graphic
│   ├── api-contract.md               # Planned API detail
│   ├── memory-policy.md              # Retention, ranking, privacy
│   └── adr/                          # Architecture decisions
├── package.json                      # Root pnpm convenience scripts
└── pnpm-workspace.yaml
```

> The tree describes the initial scaffold. Some interfaces and workflows are intentionally thin starting points; see `docs/api-contract.md` and `docs/memory-policy.md` for current implementation limits.

## API design

**Base URL:** `/v1`; protected routes require a verified auth token.

| Method | Proposed endpoint | Purpose |
|---|---|---|
| `POST` | `/v1/chat/stream` | Send message and receive server-sent events |
| `GET` | `/v1/conversations` | List own chat threads |
| `GET` | `/v1/conversations/{id}` | Retrieve an owned thread |
| `GET` | `/v1/memories` | List and filter active memories |
| `POST` | `/v1/memories/search` | Search memory with user scope |
| `PATCH` | `/v1/memories/{id}` | Correct content or classification |
| `DELETE` | `/v1/memories/{id}` | Erase memory and associated search record |
| `POST` | `/v1/feedback` | Rate a response or memory usage |
| `GET` | `/healthz` | Liveness (without exposing secrets) |

**Proposed chat request:**

```json
{
  "conversation_id": null,
  "message": "Help me plan my next FastAPI project",
  "use_memory": true
}
```

**Streaming events:** `message.start`, `message.delta`, `message.complete`, `memory.used`, `error` (with a stable error contract). The server must handle disconnections and idempotent turn identifiers.

## Local development

### Prerequisites

- Python 3.12+, [`uv`](https://docs.astral.sh/uv/)
- Node.js LTS and `pnpm`
- Docker Engine + Compose
- Valid LLM/embedding credentials, or an explicitly configured local provider

### Local startup

```bash
# 1. Configure local environment
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local

# 2. Start PostgreSQL/pgvector and Redis
docker compose -f infra/compose.yml up -d postgres redis

# 3. Install Python API deps and migrate the database
uv sync --project apps/api
uv run --project apps/api alembic -c apps/api/alembic.ini upgrade head

# Terminal A — API
uv run --project apps/api uvicorn engramloop.main:app --reload
# Terminal B — memory extraction worker
uv run --project apps/api dramatiq engramloop.jobs.worker

# Terminal C — dashboard
pnpm install
pnpm --dir apps/web dev
```

For Windows PowerShell, use `Copy-Item .env.example .env` and `Copy-Item apps/web/.env.example apps/web/.env.local` in place of `cp` if preferred. The web-specific example contains only browser-safe settings; keep provider secrets in the root `.env`.

**Scaffold `.env.example` fields (never commit real values):**

```dotenv
DATABASE_URL=postgresql+asyncpg://engramloop:engramloop@localhost:5432/engramloop
REDIS_URL=redis://localhost:6379/0
LLM_PROVIDER=openai
LLM_MODEL=gpt-6-luna
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
CLERK_JWKS_URL=
CLERK_ISSUER=
CLERK_AUDIENCE=engramloop-api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_JWT_TEMPLATE=engramloop-api
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
MEMORY_RETENTION_DAYS=365
CORS_ORIGINS=["http://localhost:3000"]
```

The web app can be viewed in preview mode without credentials; sending chat or changing server-backed memories requires Clerk and OpenAI configuration. Create a Clerk JWT template named `engramloop-api` whose `aud` claim matches `CLERK_AUDIENCE`. The scaffold separates browser-safe `NEXT_PUBLIC_*` variables from backend-only secrets. Keep the PostgreSQL driver/DSN, migration config, and embedding dimensions aligned.

## Security and privacy

- **Identity:** validate signatures, issuer, audience, expiry, and owner authorization on every protected endpoint.
- **Isolation:** enforce user/workspace filters in *all* SQL and vector queries; test cross-user access explicitly.
- **Collection:** filter secrets, credentials, health details, and other sensitive material unless needed and explicitly authorized.
- **Consent and deletion:** provide user-facing memory review and reliable deletion; define policies for logs, backups, and derived vectors.
- **Prompt injection:** memories and messages are untrusted input, not elevated system instructions.
- **Provider exposure:** disclose where message content is sent; enforce budgets, timeouts, retry caps, and rate limits.
- **Encryption:** TLS in transit; secure credentials, restricted database access, and encrypted backups.
- **Observability:** record IDs, outcomes, timing, and error types; avoid default full transcript logging.

## Testing and evaluation

### Engineering checks

```bash
# Proposed CI commands, available after code exists
uv run --project apps/api pytest
uv run --project apps/api ruff check .
pnpm --dir apps/web lint
pnpm --dir apps/web exec playwright test
```

### Evaluation matrix

| Dimension | Measurement | Failure to catch |
|---|---|---|
| Retrieval relevance | Recall@k / MRR on labeled queries | Wrong or missing relevant memories |
| Answer quality | Blind rubric rating: memory on vs off | Memory does not improve usefulness |
| Factual integrity | Contradiction and outdated-fact tests | Stale context overrides new facts |
| Privacy | Cross-user isolation and deletion tests | Data leaks or undeleted vectors |
| Performance | p50/p95 latency, token usage, queue lag | Memory increases cost/latency excessively |
| Reliability | Retry/idempotency and worker recovery tests | Duplicate writes, dropped updates |

**Minimum demo:** two distinct conversations with the same user, a demonstrably useful recalled preference, an editable memory view, and a reproducible comparison without memory enabled. Add fixtures for deliberate false memories and prompt-injection attempts.

## Delivery roadmap

- **Phase 0 — Foundations:** establish repo, CI, typed schemas, Docker Compose, health endpoint, auth contract.
- **Phase 1 — Conversational MVP:** API + Next.js chat with persistent message history and streaming.
- **Phase 2 — Durable memory:** extraction worker, pgvector search, Mem0 adapter, user-scoped memory CRUD.
- **Phase 3 — Trust:** provenance, correction/deletion flows, redaction, memory selection logs.
- **Phase 4 — Evaluation:** benchmark dataset, A/B harness, quality and latency metrics.
- **Phase 5 — Production hardening:** dashboards, rate limits, backups, recovery tests, observability, deploy.

### MVP definition of done

- A returning user can receive context-informed responses in a different conversation.
- The same memory cannot be accessed by a different authenticated user.
- Users can correct and delete memories and observe the updated behavior.
- Retrieval is explainable through IDs/sources; relevance and latency are measurable.
- The codebase has automated tests, example configuration, and a documented local run path.

## Engineering decisions and trade-offs

- **PostgreSQL + pgvector first** reduces operational overhead compared with adding a standalone vector database early.
- **Mem0 behind an interface** enables a baseline implementation while keeping space for original memory-ranking and consolidation research.
- **Background extraction** keeps perceived chat latency low, at the cost of a short delay before new memories become searchable.
- **Explicit user control** prioritizes trust over indiscriminately remembering everything.
- **No model fine-tuning in v1** keeps the project focused on observable memory and contextual learning.

## References and attribution

- [LangGraph persistence and memory documentation](https://docs.langchain.com/oss/python/langgraph/add-memory)
- [Mem0 open-source configuration](https://github.com/mem0ai/mem0/blob/main/docs/open-source/configuration.mdx)
- [pgvector](https://github.com/pgvector/pgvector)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/docs/app)

**Ownership:** Concept and proposed architecture documented by [@thetruesammyjay](https://github.com/thetruesammyjay). Third-party dependencies retain their own licenses. **Repository license:** to be chosen before distributing code; no license grant is implied by this README alone.
