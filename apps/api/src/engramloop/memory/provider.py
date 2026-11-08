from sqlalchemy.ext.asyncio import AsyncSession

from engramloop.core.config import get_settings
from engramloop.db.repositories.memories import MemoryRepository
from engramloop.memory.contracts import MemoryProvider


def get_memory_provider(session: AsyncSession) -> MemoryProvider:
    """Build the configured provider at the application boundary."""
    provider_name = get_settings().memory_provider.lower()
    if provider_name != "postgres":
        raise RuntimeError(f"Memory provider {provider_name!r} is not wired yet")
    return MemoryRepository(session)
