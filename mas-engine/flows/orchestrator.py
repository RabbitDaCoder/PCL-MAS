# Builds the single hierarchical Crew that routes every incoming request to the right agent(s).
from crewai import Crew, Process, Task

from agents.administrative_agent import build_administrative_agent
from agents.loader import build_agent
from providers.llm_factory import build_llm_for_agent


def build_orchestrator_crew() -> Crew:
    admin_llm = build_llm_for_agent("administrative")
    instructor_llm = build_llm_for_agent("instructor")
    lecturer_llm = build_llm_for_agent("lecturer")

    admin_agent = build_administrative_agent()
    instructor_agent = build_agent("Instructor", "instructor", instructor_llm)
    lecturer_agent = build_agent("Lecturer", "lecturer", lecturer_llm)

    routing_task = Task(
        description=(
            "A student, lecturer, or the platform itself has made the following request:\n\n"
            "{request}\n\n"
            "Decide which agent(s) must act and in what order, respecting their responsibility "
            "boundaries: the Admin agent only handles administrative concerns, the Instructor "
            "agent owns teaching and grading, and the Lecturer agent only reviews/validates "
            "Instructor output and liaises with the human lecturer. Produce the final response "
            "to return to the caller."
        ),
        expected_output="The final response text to return to the caller.",
    )

    return Crew(
        agents=[admin_agent, instructor_agent, lecturer_agent],
        tasks=[routing_task],
        process=Process.hierarchical,
        manager_llm=admin_llm,
        verbose=True,
    )


def run_request(request_text: str) -> str:
    crew = build_orchestrator_crew()
    result = crew.kickoff(inputs={"request": request_text})
    return str(result)
