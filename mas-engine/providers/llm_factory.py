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

    return LLM(**llm_kwargs)
