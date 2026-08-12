# Builds the Instructor Agent using its existing agent.yaml definition and dev-tier LLM.
from agents.loader import build_agent
from providers.llm_factory import build_llm_for_agent


def build_instructor_agent():
    llm = build_llm_for_agent("instructor")
    return build_agent("Instructor", "instructor", llm)
