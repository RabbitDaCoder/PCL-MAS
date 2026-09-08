# Embedding provider configuration for the Memory subsystem — a separate concern from the
# per-agent chat LLM config in config/agent_models.py, since embeddings need a genuinely
# different kind of provider/key (this project's chat provider, DeepSeek, has no embeddings
# endpoint at all).
import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class EmbeddingConfig:
    provider: str
    model: str
    api_key: str
    is_configured: bool


def get_embedding_config() -> EmbeddingConfig:
    """Reads EMBEDDING_PROVIDER/_MODEL/_API_KEY. No DEFAULT_* fallback (unlike agent_models.py) —
    a chat provider default would almost never also be an embeddings provider."""
    provider = os.getenv("EMBEDDING_PROVIDER", "")
    model = os.getenv("EMBEDDING_MODEL", "")
    api_key = os.getenv("EMBEDDING_API_KEY", "")
    return EmbeddingConfig(
        provider=provider,
        model=model,
        api_key=api_key,
        is_configured=bool(provider) and bool(model) and bool(api_key),
    )
