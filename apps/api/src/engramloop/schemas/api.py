from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    conversation_id: UUID | None = None
    message: str = Field(min_length=1, max_length=20_000)
    use_memory: bool = True


class ConversationSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    created_at: datetime
    updated_at: datetime


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    role: Literal["user", "assistant", "system"]
    content: str
    created_at: datetime


class ConversationOut(ConversationSummary):
    messages: list[MessageOut]


class MemoryCreate(BaseModel):
    content: str = Field(min_length=1, max_length=4_000)
    kind: Literal["preference", "fact", "project_context", "instruction", "episodic_summary"] = "fact"


class MemoryUpdate(BaseModel):
    content: str | None = Field(default=None, min_length=1, max_length=4_000)
    kind: Literal["preference", "fact", "project_context", "instruction", "episodic_summary"] | None = None


class MemorySourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    message_id: UUID | None
    extraction_run_id: str | None
    quote: str | None
    created_at: datetime


class MemoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    kind: str
    content: str
    state: str
    confidence: float
    version: int
    created_at: datetime
    updated_at: datetime
    sources: list[MemorySourceOut] = Field(default_factory=list)


class MemorySearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2_000)
    limit: int = Field(default=8, ge=1, le=50)


class FeedbackCreate(BaseModel):
    message_id: UUID | None = None
    rating: int = Field(ge=1, le=5)
    note: str | None = Field(default=None, max_length=2_000)
    used_memory_ids: list[UUID] = Field(default_factory=list)


class FeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime

