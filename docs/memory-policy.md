# Memory policy (initial scaffold)

EngramLoop stores selected user facts as editable records. A saved memory is context, not an instruction with system-level authority.

## Lifecycle

The target lifecycle is `candidate → validated → active → superseded/deleted`, with `needs_review` reserved for ambiguous changes. The scaffold writes validated candidates directly as active records. Duplicate exact matches are skipped. Contradictions and review queues are future work.

## Candidate rules

- Extract only stable preferences, facts, project context, and instructions.
- Keep extraction asynchronous so it does not add latency to the response stream.
- Skip messages that match the initial credential/secret patterns.
- Keep the source message ID, extraction run ID, and a short source quote for provenance.
- Treat all memory text as untrusted when building prompts.

The secret filter is deliberately small and is not a general sensitive-data classifier. Production use needs a reviewed privacy classifier, consent and retention controls, and clear deletion behavior for backups and provider-side data.

## Retrieval

- Always scope database queries to the authenticated user.
- Return active memories only; vector search uses the configured embedding dimension.
- Include memory IDs in the chat context event so the UI can show what informed a response.
- The model is told to favor the user's current message when it conflicts with stored context.
- The initial token budget uses a character-count estimate (about four characters per token), not the provider tokenizer.

## Retention and deletion

`MEMORY_RETENTION_DAYS` is configuration for the planned expiry policy; automatic expiration is not wired yet. User deletion marks the memory deleted, clears its embedding, and keeps an audit event. A production deletion policy must also define treatment of provenance, backups, and external memory-provider copies.
