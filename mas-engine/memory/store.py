# Lazily-constructed singleton wrapper around CrewAI's Memory class, plus scope-path builder
# helpers. Deliberately a singleton — unlike the rest of mas-engine, which rebuilds agents/crews
# fresh on every request — because Memory wraps a persistent on-disk vector store that's meant to
# be reused across calls, not reopened every time.
from crewai import Memory

from config.agent_models import get_agent_llm_config
from memory.embedding_config import get_embedding_config
from providers.llm_factory import build_llm_for_agent

# Per-provider embedder config-key mapping — CrewAI's embedder dict shape varies by provider
# (e.g. "model" vs "model_name"), so a raw pass-through would be easy to misconfigure. Only the
# two officially documented shapes we've verified are supported; anything else is treated as
# unconfigured rather than guessed at.
_EMBEDDER_CONFIG_KEY = {
    "openai": "model",
    "google-generativeai": "model_name",
}

_memory_instance = None
_memory_init_attempted = False


def _build_embedder(config):
    config_key = _EMBEDDER_CONFIG_KEY.get(config.provider)
    if config_key is None:
        return None
    return {
        "provider": config.provider,
        "config": {config_key: config.model, "api_key": config.api_key},
    }


def get_memory():
    """Returns the shared Memory instance, or None if embeddings aren't configured, the
    provider isn't one of the supported shapes, the Lecturer agent's LLM isn't configured
    (Memory's own reasoning LLM is reused from it), or construction fails for any reason.
    Every caller in this service must treat None as "memory is disabled" and no-op safely —
    same philosophy as MockLLM elsewhere in mas-engine."""
    global _memory_instance, _memory_init_attempted
    if _memory_init_attempted:
        return _memory_instance
    _memory_init_attempted = True

    embedding_config = get_embedding_config()
    if not embedding_config.is_configured:
        return None
    embedder = _build_embedder(embedding_config)
    if embedder is None:
        return None

    lecturer_llm_config = get_agent_llm_config("lecturer")
    if not lecturer_llm_config.is_configured:
        return None

    try:
        _memory_instance = Memory(llm=build_llm_for_agent("lecturer"), embedder=embedder)
    except Exception:
        _memory_instance = None
    return _memory_instance


def student_scope(class_id: str, student_id: str) -> str:
    return f"/class/{class_id}/student/{student_id}"


def lecturer_scope(class_id: str) -> str:
    return f"/class/{class_id}/lecturer"


def shared_scope(class_id: str) -> str:
    return f"/class/{class_id}/shared"
