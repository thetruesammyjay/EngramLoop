from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from engramloop.core.auth import get_current_user
from engramloop.db.models import Conversation, Feedback, Memory, Message
from engramloop.db.session import get_session
from engramloop.schemas.api import FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackOut, status_code=201)
async def create_feedback(
    body: FeedbackCreate,
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Feedback:
    if body.message_id is not None:
        owner = await session.scalar(
            select(Conversation.user_id)
            .join(Message, Conversation.id == Message.conversation_id)
            .where(Message.id == body.message_id)
        )
        if owner != user_id:
            raise HTTPException(status_code=404, detail="Message not found")
    unique_memory_ids = set(body.used_memory_ids)
    if unique_memory_ids:
        owned_ids = set(
            (await session.scalars(
                select(Memory.id).where(
                    Memory.user_id == user_id,
                    Memory.id.in_(unique_memory_ids),
                )
            )).all()
        )
        if owned_ids != unique_memory_ids:
            raise HTTPException(status_code=404, detail="Memory not found")
    feedback = Feedback(
        user_id=user_id,
        message_id=body.message_id,
        rating=body.rating,
        note=body.note,
        used_memory_ids=[{"id": str(memory_id)} for memory_id in body.used_memory_ids],
    )
    session.add(feedback)
    await session.commit()
    await session.refresh(feedback)
    return feedback
