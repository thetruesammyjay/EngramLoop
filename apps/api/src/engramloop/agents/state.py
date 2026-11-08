from typing import TypedDict


class AgentState(TypedDict, total=False):
    user_id: str
    query: str
    use_memory: bool
    history: list[dict[str, str]]
    memories: list[dict[str, str]]
    memory_ids: list[str]
    response: str

