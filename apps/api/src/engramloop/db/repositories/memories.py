from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from engramloop.db.models import Memory, MemoryEvent, MemorySource
from engramloop.providers.openai import embed_text


class MemoryRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_for_user(self, user_id: str, *, include_deleted: bool = False) -> Sequence[Memory]:
        query = select(Memory).where(Memory.user_id == user_id)
        if not include_deleted:
            query = query.where(Memory.state == "active")
        query = query.order_by(Memory.updated_at.desc())
        return (await self.session.scalars(query)).all()

    async def get_for_user(self, user_id: str, memory_id: UUID) -> Memory | None:
        return await self.session.scalar(
            select(Memory).where(Memory.user_id == user_id, Memory.id == memory_id)
        )

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
    ) -> Memory:
        embedding = await embed_text(content)
        memory = Memory(
            user_id=user_id,
            content=content,
            kind=kind,
            embedding=embedding,
            confidence=confidence,
        )
        self.session.add(memory)
        await self.session.flush()
        if message_id is not None or extraction_run_id is not None:
            self.session.add(
                MemorySource(
                    memory_id=memory.id,
                    message_id=message_id,
                    extraction_run_id=extraction_run_id,
                    quote=quote,
                )
            )
        self.session.add(MemoryEvent(memory_id=memory.id, action="created", previous_version=None))
        await self.session.flush()
        return memory

    async def update(
        self, user_id: str, memory_id: UUID, *, content: str | None, kind: str | None
    ) -> Memory | None:
        memory = await self.get_for_user(user_id, memory_id)
        if memory is None:
            return None
        previous_version = memory.version
        if content is not None and content != memory.content:
            memory.content = content
            memory.embedding = await embed_text(content)
        if kind is not None:
            memory.kind = kind
        memory.version += 1
        self.session.add(
            MemoryEvent(memory_id=memory.id, action="updated", previous_version=previous_version)
        )
        await self.session.flush()
        return memory

    async def delete(self, user_id: str, memory_id: UUID) -> bool:
        memory = await self.get_for_user(user_id, memory_id)
        if memory is None:
            return False
        previous_version = memory.version
        memory.state = "deleted"
        memory.embedding = None
        memory.version += 1
        self.session.add(
            MemoryEvent(memory_id=memory.id, action="deleted", previous_version=previous_version)
        )
        await self.session.flush()
        return True

    async def search(self, user_id: str, query: str, limit: int = 8) -> Sequence[Memory]:
        query_embedding = await embed_text(query)
        statement = select(Memory).where(Memory.user_id == user_id, Memory.state == "active")
        if query_embedding is not None:
            statement = (
                statement.where(Memory.embedding.is_not(None))
                .order_by(Memory.embedding.cosine_distance(query_embedding))
                .limit(limit)
            )
        else:
            # Keep local setup usable before an embedding provider is configured.
            terms = [term for term in query.split() if len(term) > 2][:8]
            if not terms:
                return []
            statement = statement.where(
                or_(*(Memory.content.ilike(f"%{term}%") for term in terms))
            )
            statement = statement.order_by(Memory.updated_at.desc()).limit(limit)
        return (await self.session.scalars(statement)).all()

