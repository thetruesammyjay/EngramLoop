from fastapi import APIRouter

from engramloop.api.v1 import chat, feedback, health, memories

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(chat.router, prefix="/v1")
api_router.include_router(memories.router, prefix="/v1")
api_router.include_router(feedback.router, prefix="/v1")
