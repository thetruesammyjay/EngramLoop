import json
import logging
from collections.abc import AsyncIterator
from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from engramloop.agents.graph import build_agent
from engramloop.core.auth import get_current_user
from engramloop.db.models import Conversation, Message
from engramloop.db.session import SessionLocal, get_session
from engramloop.jobs.extract_turn import extract_turn
from engramloop.schemas.api import ChatRequest, ConversationOut, ConversationSummary

logger = logging.getLogger(__name__)
router = APIRouter(tags=["chat"])


def _sse(event: str, data: dict[str, object]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, default=str)}\n\n"


@router.get("/conversations", response_model=list[ConversationSummary])
async def list_conversations(
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[Conversation]:
    result = await session.scalars(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .limit(100)
    )
    return list(result.all())


@router.get("/conversations/{conversation_id}", response_model=ConversationOut)
async def get_conversation(
    conversation_id: UUID,
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Conversation:
    conversation = await session.scalar(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
    )
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.post("/chat/stream")
async def stream_chat_response(
    body: ChatRequest,
    request: Request,
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> StreamingResponse:
    conversation: Conversation | None = None
    if body.conversation_id is not None:
        conversation = await session.scalar(
            select(Conversation).where(
                Conversation.id == body.conversation_id,
                Conversation.user_id == user_id,
            )
        )
        if conversation is None:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(
            user_id=user_id,
            title=body.message.strip().replace("\n", " ")[:72] or "New conversation",
        )
        session.add(conversation)
        await session.flush()

    assert conversation is not None
    previous_messages = await session.scalars(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc())
        .limit(20)
    )
    history = [
        {"role": message.role, "content": message.content[-4_000:]}
        for message in reversed(previous_messages.all())
        if message.role in {"user", "assistant"}
    ]

    user_message = Message(conversation_id=conversation.id, role="user", content=body.message)
    conversation.updated_at = datetime.now(timezone.utc)
    session.add(user_message)
    await session.commit()
    await session.refresh(user_message)

    async def events() -> AsyncIterator[str]:
        response_id = str(uuid4())
        answer_parts: list[str] = []
        used_memory_ids: list[str] = []
        yield _sse("message.start", {"response_id": response_id, "conversation_id": str(conversation.id)})
        try:
            initial_state = {
                "user_id": user_id,
                "query": body.message,
                "use_memory": body.use_memory,
                "history": history,
            }
            async with SessionLocal() as agent_session:
                graph = build_agent(agent_session)
                async for update in graph.astream(initial_state, stream_mode="custom"):
                    if await request.is_disconnected():
                        return
                    if not isinstance(update, dict):
                        continue
                    if update.get("type") == "token":
                        token = str(update.get("text", ""))
                        answer_parts.append(token)
                        yield _sse("message.delta", {"response_id": response_id, "text": token})
                    elif update.get("type") == "memory.used":
                        memories = update.get("memories", [])
                        if isinstance(memories, list):
                            used_memory_ids.extend(
                                str(item["id"])
                                for item in memories
                                if isinstance(item, dict) and "id" in item
                            )
                        yield _sse("memory.used", {"memories": memories})

            answer = "".join(answer_parts)
            assistant_message_id: UUID | None = None
            if answer:
                async with SessionLocal() as write_session:
                    assistant_message = Message(
                        conversation_id=conversation.id,
                        role="assistant",
                        content=answer,
                    )
                    write_session.add(assistant_message)
                    owner_conversation = await write_session.scalar(
                        select(Conversation).where(
                            Conversation.id == conversation.id,
                            Conversation.user_id == user_id,
                        )
                    )
                    if owner_conversation is not None:
                        owner_conversation.updated_at = datetime.now(timezone.utc)
                    await write_session.commit()
                    await write_session.refresh(assistant_message)
                    assistant_message_id = assistant_message.id

            try:
                extract_turn.send(
                    user_id=user_id,
                    conversation_id=str(conversation.id),
                    message_id=str(user_message.id),
                )
            except Exception:
                logger.exception("Could not enqueue memory extraction")
            yield _sse(
                "message.complete",
                {
                    "response_id": response_id,
                    "conversation_id": str(conversation.id),
                    "message_id": str(assistant_message_id) if assistant_message_id else None,
                    "used_memory_ids": used_memory_ids,
                },
            )
        except Exception:
            logger.exception("Chat stream failed")
            yield _sse("error", {"code": "chat_failed", "message": "The response could not be completed."})

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )
