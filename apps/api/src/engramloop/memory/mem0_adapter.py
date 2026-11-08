"""Optional Mem0 bridge kept behind a narrow interface.

The SQL-backed provider is the default because it preserves EngramLoop's provenance and
version history. This adapter can be wired after a deployment chooses a Mem0 configuration.
"""

import asyncio
from typing import Any


class Mem0Adapter:
    def __init__(self, client: Any) -> None:
        self._client = client

    @classmethod
    def from_environment(cls) -> "Mem0Adapter":
        try:
            from mem0 import Memory
        except ImportError as exc:
            raise RuntimeError("Install the optional mem0ai package to use this adapter") from exc
        return cls(Memory())

    async def add(self, text: str, *, user_id: str, metadata: dict[str, Any] | None = None) -> Any:
        return await asyncio.to_thread(
            self._client.add, text, user_id=user_id, metadata=metadata or {}
        )

    async def search(self, query: str, *, user_id: str, limit: int = 8) -> Any:
        return await asyncio.to_thread(
            self._client.search, query, user_id=user_id, limit=limit
        )

