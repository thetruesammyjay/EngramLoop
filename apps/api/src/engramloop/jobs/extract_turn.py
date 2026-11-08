import asyncio
from uuid import UUID

import dramatiq

from engramloop.jobs.broker import broker
from engramloop.memory.extraction import extract_user_turn


@dramatiq.actor(broker=broker, max_retries=3, time_limit=120_000)
def extract_turn(user_id: str, conversation_id: str, message_id: str) -> int:
    return asyncio.run(extract_user_turn(user_id, UUID(conversation_id), UUID(message_id)))

