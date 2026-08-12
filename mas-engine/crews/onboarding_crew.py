# Builds and runs the single-agent Crew that generates a student's proactive 1:1 onboarding
# greeting. Falls back to a clearly-labeled mock message when the Administrative Agent has no
# configured LLM — same contract every other AI-touching part of this service already follows.
from crewai import Crew, Process

from agents.administrative_agent import build_administrative_agent
from config.agent_models import get_agent_llm_config
from tasks.onboarding_dm_task import build_onboarding_dm_task


def _mock_message(student_first_name: str, class_name: str) -> str:
    return (
        f"[MOCK — Administrative agent has no API key configured] Hi {student_first_name}, "
        f"welcome to {class_name}! Please take your pre-test to get started."
    )


def generate_onboarding_message(
    *,
    student_first_name: str,
    class_name: str,
    topics: list[str],
    learning_objectives: list[str],
    pretest_status: str,
) -> str:
    config = get_agent_llm_config("administrative")
    if not config.is_configured:
        return _mock_message(student_first_name, class_name)

    inputs = {
        "student_first_name": student_first_name,
        "class_name": class_name,
        "topics": ", ".join(topics) or "Not specified",
        "learning_objectives": ", ".join(learning_objectives) or "Not specified",
        "pretest_status": pretest_status,
    }

    agent = build_administrative_agent()
    task = build_onboarding_dm_task(agent)
    crew = Crew(agents=[agent], tasks=[task], process=Process.sequential, verbose=True)
    raw = crew.kickoff(inputs=inputs)
    return str(raw).strip()
