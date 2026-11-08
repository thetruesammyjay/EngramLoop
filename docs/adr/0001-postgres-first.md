# ADR 0001: PostgreSQL as the first durable store

- **Status:** Accepted for the initial scaffold
- **Decision:** Use PostgreSQL with pgvector for application records and semantic memory search.
- **Context:** The MVP needs user-scoped records, provenance, audit events, conversation history, and vector retrieval without another database service.
- **Consequences:** Keep vector dimensions aligned with the embedding model. Add migrations for schema changes. Routes select the PostgreSQL repository through a provider boundary; finish the Mem0 adapter contract before making it swappable.

