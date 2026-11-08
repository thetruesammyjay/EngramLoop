from collections.abc import AsyncIterator

from openai import AsyncOpenAI

from engramloop.core.config import get_settings


def _client() -> AsyncOpenAI:
    settings = get_settings()
    if settings.llm_provider.lower() != "openai":
        raise RuntimeError("Only the OpenAI provider is wired in this scaffold")
    if not settings.openai_api_key:
        raise RuntimeError("Set OPENAI_API_KEY to enable chat and embedding providers")
    return AsyncOpenAI(api_key=settings.openai_api_key)


async def embed_text(text: str) -> list[float] | None:
    settings = get_settings()
    if not settings.openai_api_key:
        return None
    response = await _client().embeddings.create(model=settings.embedding_model, input=text)
    return response.data[0].embedding


async def stream_chat(messages: list[dict[str, str]]) -> AsyncIterator[str]:
    settings = get_settings()
    stream = await _client().chat.completions.create(
        model=settings.llm_model,
        messages=messages,  # type: ignore[arg-type]
        stream=True,
    )
    async for chunk in stream:
        text = chunk.choices[0].delta.content
        if text:
            yield text


async def extract_json(prompt: str, transcript: str) -> str:
    settings = get_settings()
    response = await _client().chat.completions.create(
        model=settings.llm_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": transcript},
        ],
    )
    return response.choices[0].message.content or "{}"

