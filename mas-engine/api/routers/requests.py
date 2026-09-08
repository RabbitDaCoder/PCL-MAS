# Accepts a request from the backend and routes it through the orchestrator Crew. When classId +
# studentId are given, recalls relevant memories into the prompt and schedules extraction of new
# ones after the response is sent — memory is entirely additive context, never a code path that
# can change what an agent is instructed to do.
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from flows.orchestrator import run_request
from memory.pipeline import extract_and_remember, recall_context
from memory.store import lecturer_scope, shared_scope, student_scope

router = APIRouter(tags=["requests"])

_REAL_AGENTS = ("admin", "instructor", "lecturer")


class RequestPayload(BaseModel):
    request: str
    classId: str | None = None
    studentId: str | None = None


class ChatTurnResponse(BaseModel):
    agent: str
    message: str


class RequestResponse(BaseModel):
    turns: list[ChatTurnResponse]


@router.post("/requests", response_model=RequestResponse)
def post_request(payload: RequestPayload, background_tasks: BackgroundTasks) -> RequestResponse:
    request_text = payload.request
    scope = None
    if payload.classId and payload.studentId:
        scope = student_scope(payload.classId, payload.studentId)
        memory_context = recall_context(
            [
                (scope, "About this student"),
                (lecturer_scope(payload.classId), "Lecturer preferences for this class"),
                (shared_scope(payload.classId), "Common patterns in this class"),
            ],
            payload.request,
        )
        if memory_context:
            request_text = (
                "Relevant things you remember about this student and class from past "
                f"interactions (use if helpful, ignore if not relevant):\n{memory_context}\n\n"
                f"{payload.request}"
            )

    turns = run_request(request_text)

    # Only genuine agent turns are worth remembering — skip the "service unavailable" fallback.
    real_turns = [t for t in turns if t.get("agent", "").lower() in _REAL_AGENTS]
    if scope and real_turns:
        exchange_text = f"Student asked: {payload.request}\n" + "\n".join(
            f"{t['agent']} replied: {t['message']}" for t in real_turns
        )
        background_tasks.add_task(extract_and_remember, scope, exchange_text)
        background_tasks.add_task(
            extract_and_remember, shared_scope(payload.classId), exchange_text
        )

    return RequestResponse(turns=turns)
