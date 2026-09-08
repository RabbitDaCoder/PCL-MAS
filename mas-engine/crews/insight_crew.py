# Builds and runs the single-agent Crew that turns aggregated performance data into improvement
# suggestions. No mock fallback here (unlike pretest_crew.py/learning_path_crew.py) — if the
# Lecturer agent's LLM isn't configured, generation is simply unavailable rather than returning
# fabricated-looking mock insights a lecturer might mistake for real evidence-backed ones.
from crewai import Crew, Process

from agents.improvement_analyst_agent import build_improvement_analyst_agent
from config.agent_models import get_agent_llm_config
from schemas.insight import Insight, parse_insights
from tasks.insight_generation_task import build_insight_generation_task


class InsightGenerationError(Exception):
    """Raised when the Improvement Analyst's output can't be parsed into valid insights after a
    retry, or when it has no configured LLM to run at all."""


def generate_insights(*, topics: list[str], metrics_summary: str) -> list[Insight]:
    config = get_agent_llm_config("lecturer")
    if not config.is_configured:
        raise InsightGenerationError(
            "Insight generation isn't available — the Lecturer agent has no configured LLM."
        )

    inputs = {
        "topics": ", ".join(topics) or "Not specified",
        "metrics_summary": metrics_summary,
    }

    def run_once() -> list[Insight]:
        agent = build_improvement_analyst_agent()
        task = build_insight_generation_task(agent)
        crew = Crew(agents=[agent], tasks=[task], process=Process.sequential, verbose=True)
        raw = crew.kickoff(inputs=inputs)
        return parse_insights(str(raw))

    try:
        return run_once()
    except ValueError:
        try:
            return run_once()
        except ValueError as exc:
            raise InsightGenerationError(
                "The AI couldn't generate a valid insight list. Please try again."
            ) from exc
