import re

_SECRET_PATTERNS = (
    re.compile(r"(?i)\b(api[_ -]?key|password|secret|access[_ -]?token)\s*[:=]\s*\S+"),
    re.compile(r"\b(?:sk|rk)-[A-Za-z0-9_-]{16,}\b"),
    re.compile(r"-----BEGIN (?:RSA )?PRIVATE KEY-----"),
)


def contains_secret(text: str) -> bool:
    return any(pattern.search(text) for pattern in _SECRET_PATTERNS)


def redact_secrets(text: str) -> str:
    for pattern in _SECRET_PATTERNS:
        text = pattern.sub("[redacted]", text)
    return text

