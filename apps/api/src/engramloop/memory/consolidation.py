import re
from collections.abc import Sequence

from engramloop.db.models import Memory


def _normalize(value: str) -> str:
    return re.sub(r"\W+", " ", value.casefold()).strip()


def is_duplicate(candidate: str, existing: Sequence[Memory]) -> bool:
    candidate_key = _normalize(candidate)
    return any(_normalize(memory.content) == candidate_key for memory in existing)

