"""Builds the LLM each agent uses — a real CrewAI LLM if configured, else a labeled MockLLM.
Never falls back from a real client to a mock on API errors; mock mode only means "no key yet"."""

from crewai import LLM

from config.agent_models import get_agent_llm_config

# Our _PROVIDER env values don't always match LiteLLM's model-string prefix (e.g. Google AI
# Studio's LiteLLM prefix is "gemini", not "google") — map the exceptions, pass others through.
_LITELLM_PREFIX_MAP = {"google": "gemini"}


class MockLLM:
    """Inert stand-in used until an agent has a real provider/model/key. Every response is
    clearly tagged so it can never be mistaken for real model output downstream."""

    def __init__(self, agent_name: str) -> None:
        self.agent_name = agent_name
        self.model = "mock"

    def call(self, *args, **kwargs) -> str:
        return f"[MOCK — {self.agent_name} agent has no API key configured]"


_QUOTA_ERROR_TOKENS = [
    "429",
    "resource_exhausted",
    "quota",
    "rate limit",
    "rate_limit",
    "exceeded your current quota",
]


def _guard_quota_errors(agent_name: str, llm) -> None:
    """Patches quota/rate-limit safety directly onto a real LLM instance's `call` method.

    CrewAI's Agent requires `llm` to be a string or an actual BaseLLM instance — wrapping it
    in a separate class (as this used to do) fails that validation. Patching the instance
    keeps it a real BaseLLM while still converting quota failures into a safe fallback text."""
    original_call = llm.call

    def guarded_call(*args, **kwargs):
        try:
            return original_call(*args, **kwargs)
        except Exception as exc:  # pragma: no cover - runtime safeguard for quota exhaustion
            message = str(exc).lower()
            if any(token in message for token in _QUOTA_ERROR_TOKENS):
                return (
                    f"[AI UNAVAILABLE — {agent_name} agent: API quota has been exhausted "
                    f"(model: {llm.model}). Please check the provider's billing/rate limits or "
                    "try again later.]"
                )
            raise

    llm.call = guarded_call


def build_llm_for_agent(agent_name: str):
    config = get_agent_llm_config(agent_name)

    if not config.is_configured:
        return MockLLM(agent_name)

    litellm_prefix = _LITELLM_PREFIX_MAP.get(config.provider, config.provider)

    llm_kwargs = {
        "model": f"{litellm_prefix}/{config.model}",
        "api_key": config.api_key,
    }

    # Groq rejects prompt-caching metadata on system messages (for example the
    # unsupported `cache_breakpoint` field). We explicitly ask LiteLLM to drop
    # provider-specific unsupported params so the request remains compatible.
    if config.provider == "groq":
        llm_kwargs["additional_params"] = {"drop_params": True}
        llm_kwargs["provider"] = "groq"

    llm = LLM(**llm_kwargs)
    _guard_quota_errors(agent_name, llm)
    return llm
