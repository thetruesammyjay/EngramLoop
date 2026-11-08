from collections.abc import Sequence
from typing import Protocol
from uuid import UUID

from engramloop.db.models import Memory


class MemoryProvider(Protocol):
    async def list_for_user(self, user_id: str, *, include_deleted: bool = False) -> Sequence[Memory]: ...

    async def get_for_user(self, user_id: str, memory_id: UUID) -> Memory | None: ...

    async def search(self, user_id: str, query: str, limit: int = 8) -> Sequence[Memory]: ...

    async def create(
        self,
        user_id: str,
        content: str,
        kind: str,
        *,
        message_id: UUID | None = None,
        quote: str | None = None,
        extraction_run_id: str | None = None,
        confidence: float = 0.8,
    ) -> Memory: ...

    async def update(
        self, user_id: str, memory_id: UUID, *, content: str | None, kind: str | None
    ) -> Memory | None: ...

    async def delete(self, user_id: str, memory_id: UUID) -> bool: ...

