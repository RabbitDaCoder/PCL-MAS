# Builds the single hierarchical Crew that routes every incoming request to the right agent(s).
import re
from typing import Literal

from crewai import Crew, Process, Task
from pydantic import BaseModel

from agents.administrative_agent import build_administrative_agent
from agents.loader import build_agent
from providers.llm_factory import build_llm_for_agent

# LiteLLM wraps provider errors as "<Provider>Exception" (e.g. "DeepseekException",
# "GeminiException") — pull that name out so the quota message names whichever
# provider actually failed instead of assuming one.
_PROVIDER_EXCEPTION_RE = re.compile(r"(\w+)Exception")
_PROVIDER_DISPLAY_NAMES = {
    "deepseek": "DeepSeek",
    "gemini": "Gemini",
    "google": "Google",
    "openai": "OpenAI",
    "groq": "Groq",
    "anthropic": "Anthropic",
}


def _provider_name_from_exception(message: str) -> str:
    match = _PROVIDER_EXCEPTION_RE.search(message)
    if not match:
        return "the AI provider"
    name = match.group(1)
    return _PROVIDER_DISPLAY_NAMES.get(name.lower(), name)


class ChatTurn(BaseModel):
    agent: Literal["Admin", "Instructor", "Lecturer"]
    message: str


class ChatTurns(BaseModel):
    turns: list[ChatTurn]


def build_orchestrator_crew() -> Crew:
    instructor_llm = build_llm_for_agent("instructor")
    lecturer_llm = build_llm_for_agent("lecturer")

    admin_agent = build_administrative_agent()
    instructor_agent = build_agent("Instructor", "instructor", instructor_llm)
    # The Lecturer is the manager, not a worker: CrewAI forbids a manager_agent from also
    # appearing in `agents`, and it drives delegation using its own role/goal/backstory
    # instead of a generic auto-manager persona.
    lecturer_agent = build_agent("Lecturer", "lecturer", lecturer_llm)

    routing_task = Task(
        description=(
            "A student, lecturer, or the platform itself has made the following request:\n\n"
            "{request}\n\n"
            "As the Lecturer, you are the academic supervisor: decide which of the Admin and "
            "Instructor agents must act and in what order, respecting their responsibility "
            "boundaries — the Admin agent only handles administrative concerns, and the "
            "Instructor agent owns teaching and grading. Delegate work to them as tasks; don't "
            "do their jobs yourself.\n\n"
            "Chain every step automatically: whenever one agent finishing its part naturally "
            "leads into another agent's job, delegate to that next agent immediately — do not "
            "stop and wait for the student to prompt again. Only stop the chain where it "
            "genuinely must — e.g. waiting on something only the student or the human lecturer "
            "can do (like reviewing/approving something), not because another AI agent hasn't "
            "gotten around to it yet.\n\n"
            "If the request text says the student explicitly addressed a specific agent with "
            "\"@Admin\", \"@Instructor\", or \"@Lecturer\", that named agent MUST be the one who "
            "directly responds — do not silently reassign it to a different agent just because "
            "you judge another agent better suited, unless the request is genuinely outside the "
            "named agent's scope entirely, in which case that agent should briefly say so itself "
            "and hand off, rather than you routing around it unannounced.\n\n"
            "Concretely, when the Admin agent confirms an administrative milestone (like the "
            "pre-test) is recorded and that milestone means teaching should begin: you MUST "
            "also delegate to the Instructor agent right away, and its turn MUST give one "
            "concrete, present-tense action the student can take right now — never hedge with "
            "future tense like 'will soon', 'shortly', 'coming up', or 'in the meantime there's "
            "nothing more you need to do'; those all mean you failed to actually chain the next "
            "step and only promised it. The Admin agent must never claim it will personally "
            "support the student through lessons or assignments — that is explicitly the "
            "Instructor's role, not Admin's; if you catch a draft doing this, delegate to the "
            "Instructor and let it speak for itself instead. Before including any Instructor "
            "output, review it against known course materials for accuracy. Never invent "
            "specific course content, unit names, or materials that weren't given in the "
            "request. When the request includes course material excerpts, those excerpts are "
            "the source of truth — answer from them directly instead of speaking generically. "
            "The 'speak in general terms instead of guessing' rule only applies when a class "
            "has no material excerpts to draw from.\n\n"
            "Output each contributing agent's part as its OWN separate turn, tagged with "
            "exactly which agent is speaking (Admin, Instructor, or Lecturer) — never blend two "
            "agents' words into a single turn, and never write in an agent's voice yourself "
            "unless you (the Lecturer) are the one actually replying. Each turn's message must "
            "be the exact text that agent would send in the chat — no reasoning, no "
            'meta-commentary, no headers, no preamble like "Here is the final response".'
        ),
        expected_output=(
            "A JSON object with a `turns` array. Each item has `agent` (exactly \"Admin\", "
            '"Instructor", or "Lecturer") and `message` (that agent\'s own chat message, '
            "verbatim, with no reasoning or meta-commentary). One item per agent that actually "
            "speaks, in the order they should appear in the chat."
        ),
        output_pydantic=ChatTurns,
    )

    return Crew(
        agents=[admin_agent, instructor_agent],
        tasks=[routing_task],
        process=Process.hierarchical,
        manager_agent=lecturer_agent,
        verbose=True,
    )


def run_request(request_text: str) -> list[dict]:
    try:
        crew = build_orchestrator_crew()
        result = crew.kickoff(inputs={"request": request_text})
        if result.pydantic is not None:
            return [turn.model_dump() for turn in result.pydantic.turns]
        # Structured parsing failed but the crew still produced text — surface it as a
        # single Lecturer turn rather than silently dropping the response.
        return [{"agent": "Lecturer", "message": str(result)}]
    except Exception as exc:  # pragma: no cover - runtime safeguard for provider quota exhaustion
        message = str(exc)
        lower_message = message.lower()
        if any(
            token in lower_message
            for token in ["429", "resource_exhausted", "quota", "rate limit", "rate_limit"]
        ):
            provider_name = _provider_name_from_exception(message)
            fallback_text = (
                f"The AI service is temporarily unavailable because the {provider_name} API quota has "
                f"been reached. Please check the {provider_name} account's billing/rate limits or try "
                "again later."
            )
        else:
            fallback_text = "The AI service is temporarily unavailable. Please try again later."
        return [{"agent": "System", "message": fallback_text}]
