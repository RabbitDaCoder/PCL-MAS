# Builds the Improvement Analyst using its existing agent.yaml definition. Reuses the Lecturer
# agent's configured LLM rather than requiring a fourth separate LLM config — this is a read-only
# meta-analysis task (reasoning over already-collected data), not conversational or
# content-generation work, so the Lecturer's model is a reasonable, zero-new-config fit.
from agents.loader import build_agent
from providers.llm_factory import build_llm_for_agent


def build_improvement_analyst_agent():
    llm = build_llm_for_agent("lecturer")
    return build_agent("ImprovementAnalyst", "improvement_analyst", llm)
