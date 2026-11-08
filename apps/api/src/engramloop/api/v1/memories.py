from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from engramloop.core.auth import get_current_user
from engramloop.db.models import Memory
from engramloop.db.session import get_session
from engramloop.memory.provider import get_memory_provider
from engramloop.schemas.api import MemoryCreate, MemoryOut, MemorySearchRequest, MemoryUpdate

router = APIRouter(prefix="/memories", tags=["memories"])


@router.get("", response_model=list[MemoryOut])
async def list_memories(
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
    kind: Annotated[str | None, Query(max_length=40)] = None,
) -> list[Memory]:
    query = (
        select(Memory)
        .options(selectinload(Memory.sources))
        .where(Memory.user_id == user_id, Memory.state == "active")
        .order_by(Memory.updated_at.desc())
    )
    if kind:
        query = query.where(Memory.kind == kind)
    return list((await session.scalars(query)).all())


@router.post("", response_model=MemoryOut, status_code=status.HTTP_201_CREATED)
async def create_memory(
    body: MemoryCreate,
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Memory:
    memory = await get_memory_provider(session).create(user_id, body.content, body.kind)
    await session.commit()
    return memory


@router.post("/search", response_model=list[MemoryOut])
async def search_memories(
    body: MemorySearchRequest,
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[Memory]:
    results = await get_memory_provider(session).search(user_id, body.query, body.limit)
    return list(results)


@router.patch("/{memory_id}", response_model=MemoryOut)
async def update_memory(
    memory_id: UUID,
    body: MemoryUpdate,
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Memory:
    memory = await get_memory_provider(session).update(
        user_id, memory_id, content=body.content, kind=body.kind
    )
    if memory is None:
        raise HTTPException(status_code=404, detail="Memory not found")
    await session.commit()
    return memory


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(
    memory_id: UUID,
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    deleted = await get_memory_provider(session).delete(user_id, memory_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Memory not found")
    await session.commit()

