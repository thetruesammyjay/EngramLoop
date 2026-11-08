from collections.abc import Sequence

from engramloop.db.models import Memory
from engramloop.memory.contracts import MemoryProvider


async def retrieve_for_prompt(
    repository: MemoryProvider, user_id: str, query: str, *, limit: int = 8
) -> Sequence[Memory]:
    """Retrieve active memories through an owner-scoped repository query."""
    return await repository.search(user_id, query, limit=limit)

