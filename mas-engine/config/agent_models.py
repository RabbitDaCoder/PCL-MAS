"""Per-agent LLM configuration — the one place that knows env var names/provider strings."""

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()

_ENV_PREFIXES = {
    "administrative": "ADMIN_AGENT",
    "instructor": "INSTRUCTOR_AGENT",
    "lecturer": "LECTURER_AGENT",
}


@dataclass(frozen=True)
class AgentLLMConfig:
    agent_name: str
    provider: str
    model: str
    api_key: str
    is_configured: bool


def get_agent_llm_config(agent_name: str) -> AgentLLMConfig:
    """Reads <AGENT>_PROVIDER/_MODEL/_API_KEY (falling back to DEFAULT_*) for one of the three
    known agents. Raises on any other agent_name — an unknown agent is a config bug."""
    if agent_name not in _ENV_PREFIXES:
        raise ValueError(
            f"Unknown agent_name '{agent_name}'. Must be one of {tuple(_ENV_PREFIXES)}."
        )

    prefix = _ENV_PREFIXES[agent_name]
    default_provider = os.getenv("DEFAULT_PROVIDER", "")
    default_api_key = os.getenv("DEFAULT_API_KEY", "")

    provider = os.getenv(f"{prefix}_PROVIDER") or default_provider
    model = os.getenv(f"{prefix}_MODEL", "")
    api_key = os.getenv(f"{prefix}_API_KEY") or default_api_key

    return AgentLLMConfig(
        agent_name=agent_name,
        provider=provider,
        model=model,
        api_key=api_key,
        is_configured=bool(model) and bool(api_key),
    )
