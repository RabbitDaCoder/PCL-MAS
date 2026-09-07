# Builds the Lecturer Agent using its existing agent.yaml definition and dev-tier LLM. Shared by
# the reactive chat orchestrator's manager role (flows/orchestrator.py) and the single-agent
# pretest crew (crews/pretest_crew.py), which uses it as a plain worker, not a manager.
from agents.loader import build_agent
from providers.llm_factory import build_llm_for_agent


def build_lecturer_agent():
    llm = build_llm_for_agent("lecturer")
    return build_agent("Lecturer", "lecturer", llm)
