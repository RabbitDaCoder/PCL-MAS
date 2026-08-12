# Builds the Administrative Agent using its existing agent.yaml definition and dev-tier LLM.
# Shared by the reactive chat orchestrator (flows/orchestrator.py) and the proactive onboarding
# crew (crews/onboarding_crew.py) — one definition, not duplicated per caller.
from agents.loader import build_agent
from providers.llm_factory import build_llm_for_agent


def build_administrative_agent():
    llm = build_llm_for_agent("administrative")
    return build_agent("Admin", "admin", llm)
