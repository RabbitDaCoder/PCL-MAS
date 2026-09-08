# Accepts a lecturer's free-text review feedback (from approving/rejecting an assessment or
# learning path) and remembers it as a lecturer-preference fact for that class — the only place
# anything writes to the lecturer memory scope. Runs as a background task so this endpoint never
# adds latency to the Node backend's fire-and-forget call.
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from memory.pipeline import extract_and_remember
from memory.store import lecturer_scope

router = APIRouter(tags=["memory"])


class RememberLecturerFeedbackPayload(BaseModel):
    classId: str
    feedbackText: str


@router.post("/remember-lecturer-feedback")
def post_remember_lecturer_feedback(
    payload: RememberLecturerFeedbackPayload,
    background_tasks: BackgroundTasks,
) -> dict:
    background_tasks.add_task(
        extract_and_remember, lecturer_scope(payload.classId), payload.feedbackText
    )
    return {"status": "accepted"}
