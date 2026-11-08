# API contract (initial scaffold)

Base path: `/v1`. Protected routes require a Clerk bearer JWT. Configure `CLERK_JWKS_URL`, `CLERK_ISSUER`, and `CLERK_AUDIENCE`. Define a Clerk JWT template named `engramloop-api` with an `aud` claim that matches the configured audience. The API derives the owner from the verified JWT `sub`; clients must not send an owner ID.

## Routes

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| `GET` | `/healthz` | No | Process liveness |
| `GET` | `/readyz` | No | Database readiness |
| `POST` | `/v1/chat/stream` | Yes | Persist a user turn and stream a response as SSE |
| `GET` | `/v1/conversations` | Yes | List the current user's conversations |
| `GET` | `/v1/conversations/{id}` | Yes | Read one owned conversation with messages |
| `GET` | `/v1/memories` | Yes | List active memories; optional `kind` filter |
| `POST` | `/v1/memories` | Yes | Save a user-authored memory |
| `POST` | `/v1/memories/search` | Yes | Search active memories |
| `PATCH` | `/v1/memories/{id}` | Yes | Edit content or kind and increment its version |
| `DELETE` | `/v1/memories/{id}` | Yes | Mark a memory deleted and clear its embedding |
| `POST` | `/v1/feedback` | Yes | Store a response rating and optional note |

## Chat payload

```json
{
  "conversation_id": null,
  "message": "Help me plan a FastAPI project",
  "use_memory": true
}
```

The response uses `text/event-stream`. Events are `message.start`, `memory.used`, `message.delta`, `message.complete`, and `error`. Each event has a JSON `data` field. The current implementation stores the user message before starting the stream, passes the latest 20 messages from the conversation to the agent, and stores the assistant message after successful generation.

## Scaffold limits

- OpenAI is the only wired chat and embedding provider; configure `OPENAI_API_KEY`.
- Clerk JWT verification requires `CLERK_JWKS_URL`. Set issuer and audience when the Clerk token template requires them.
- Conversation creation is implicit on the first chat request; explicit conversation CRUD is not included.
- Recent messages are stored in PostgreSQL; a LangGraph checkpoint saver is not wired yet.
- Stream cancellation and retries are best-effort; idempotency keys are not implemented yet.
- `POST /v1/memories/search` uses vector ranking when embeddings are configured and a lightweight text fallback otherwise.
