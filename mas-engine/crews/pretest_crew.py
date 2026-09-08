# Builds and runs the single-agent Crew that generates a pre-test or post-test. Falls back to
# clearly-labeled mock questions when the Lecturer Agent has no configured LLM — same contract
# every other AI-touching part of this service already follows.
from crewai import Crew, Process

from agents.lecturer_agent import build_lecturer_agent
from config.agent_models import get_agent_llm_config
from schemas.assessment import AssessmentQuestion, parse_questions
from tasks.pretest_generation_task import build_test_generation_task

_DEFAULT_QUESTION_COUNT = 8


class AssessmentGenerationError(Exception):
    """Raised when the Lecturer Agent's output can't be parsed into valid questions after a
    retry — callers should surface this as a clear error, not pass malformed data upstream."""


def _mock_questions(topics: list[str]) -> list[AssessmentQuestion]:
    subjects = topics or ["General"]
    return [
        AssessmentQuestion(
            topic=topic,
            question=f"[MOCK — Lecturer agent has no API key configured] Sample question about {topic}?",
            options=["Option A", "Option B", "Option C", "Option D"],
            correctIndex=0,
        )
        for topic in subjects
    ]


def generate_assessment_questions(
    *,
    assessment_type: str,
    topics: list[str],
    learning_objectives: list[str],
    materials_text: str,
    lecturer_instructions: str = "",
    memory_context: str = "",
    question_count: int = _DEFAULT_QUESTION_COUNT,
) -> list[AssessmentQuestion]:
    config = get_agent_llm_config("lecturer")
    if not config.is_configured:
        return _mock_questions(topics)

    inputs = {
        "topics": ", ".join(topics) or "Not specified",
        "learning_objectives": ", ".join(learning_objectives) or "Not specified",
        "materials_text": materials_text or "(no materials uploaded yet)",
        "lecturer_instructions": lecturer_instructions or "(none given)",
        "memory_context": memory_context or "(nothing remembered yet)",
        "question_count": question_count,
    }

    def run_once() -> list[AssessmentQuestion]:
        agent = build_lecturer_agent()
        task = build_test_generation_task(agent, assessment_type)
        crew = Crew(agents=[agent], tasks=[task], process=Process.sequential, verbose=True)
        raw = crew.kickoff(inputs=inputs)
        return parse_questions(str(raw))

    try:
        return run_once()
    except ValueError:
        try:
            return run_once()
        except ValueError as exc:
            raise AssessmentGenerationError(
                "The AI couldn't generate a valid question set. Please try again."
            ) from exc
