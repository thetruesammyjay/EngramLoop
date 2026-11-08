from collections.abc import Awaitable, Callable
from typing import TypedDict

from langgraph.config import get_stream_writer
from sqlalchemy.ext.asyncio import AsyncSession

from engramloop.agents.state import AgentState
from engramloop.core.config import get_settings
from engramloop.memory.retrieval import retrieve_for_prompt
from engramloop.memory.provider import get_memory_provider


class RetrievalUpdate(TypedDict):
    memories: list[dict[str, str]]
    memory_ids: list[str]


def make_retrieve_node(
    session: AsyncSession,
) -> Callable[[AgentState], Awaitable[RetrievalUpdate]]:
    repository = get_memory_provider(session)

    async def retrieve(state: AgentState) -> RetrievalUpdate:
        memories = []
        if state.get("use_memory", True):
            memories = list(
                await retrieve_for_prompt(
                    repository,
                    state["user_id"],
                    state["query"],
                    limit=max(1, get_settings().memory_token_budget // 80),
                )
            )
        remaining_chars = get_settings().memory_token_budget * 4
        serialized: list[dict[str, str]] = []
        for memory in memories:
            if remaining_chars <= 0:
                break
            content = memory.content[:remaining_chars]
            serialized.append({"id": str(memory.id), "kind": memory.kind, "content": content})
            remaining_chars -= len(content)
        if serialized:
            get_stream_writer()({"type": "memory.used", "memories": serialized})
        return {"memories": serialized, "memory_ids": [item["id"] for item in serialized]}

    return retrieve
