# Builds and runs the single-agent Crew that generates a personalized learning path. Falls back
# to a clearly-labeled mock plan when the Instructor Agent has no configured LLM.
from crewai import Crew, Process

from agents.instructor_agent import build_instructor_agent
from config.agent_models import get_agent_llm_config
from schemas.learning_path import LearningPathResult, LearningPathStep, parse_learning_path
from tasks.learning_path_task import build_learning_path_task


class LearningPathGenerationError(Exception):
    """Raised when the Instructor Agent's output can't be parsed into a valid learning path
    after a retry — callers should surface this as a clear error, not pass malformed data upstream."""


def _mock_learning_path(weak_topics: list[str], topics: list[str]) -> LearningPathResult:
    focus_topics = weak_topics or topics or ["General"]
    return LearningPathResult(
        summary="[MOCK — Instructor agent has no API key configured] Sample learning path.",
        steps=[
            LearningPathStep(
                topic=topic,
                priority="high",
                recommendation=f"Review the materials and re-attempt practice questions on {topic}.",
            )
            for topic in focus_topics
        ],
    )


def generate_learning_path(
    *,
    topics: list[str],
    learning_objectives: list[str],
    topic_scores: dict[str, float],
    weak_topics: list[str],
    lecturer_instructions: str = "",
    memory_context: str = "",
) -> LearningPathResult:
    config = get_agent_llm_config("instructor")
    if not config.is_configured:
        return _mock_learning_path(weak_topics, topics)

    inputs = {
        "topics": ", ".join(topics) or "Not specified",
        "learning_objectives": ", ".join(learning_objectives) or "Not specified",
        "topic_scores": ", ".join(f"{t}: {s:.0f}" for t, s in topic_scores.items())
        or "No scores available",
        "weak_topics": ", ".join(weak_topics) or "None identified",
        "lecturer_instructions": lecturer_instructions or "(none given)",
        "memory_context": memory_context or "(nothing remembered yet)",
    }

    def run_once() -> LearningPathResult:
        agent = build_instructor_agent()
        task = build_learning_path_task(agent)
        crew = Crew(agents=[agent], tasks=[task], process=Process.sequential, verbose=True)
        raw = crew.kickoff(inputs=inputs)
        return parse_learning_path(str(raw))

    try:
        return run_once()
    except ValueError:
        try:
            return run_once()
        except ValueError as exc:
            raise LearningPathGenerationError(
                "The AI couldn't generate a valid learning path. Please try again."
            ) from exc
