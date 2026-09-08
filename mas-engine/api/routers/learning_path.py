# Accepts one student's per-topic pre-test scores and returns a personalized learning path. When
# classId + studentId are given, recalls relevant memories into the prompt and schedules
# extraction of the resulting plan afterward — memory is additive context only.
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from crews.learning_path_crew import (
    LearningPathGenerationError,
    generate_learning_path,
)
from memory.pipeline import extract_and_remember, recall_context
from memory.store import lecturer_scope, shared_scope, student_scope
from schemas.learning_path import LearningPathResult

router = APIRouter(tags=["learning-path"])


class GenerateLearningPathPayload(BaseModel):
    topics: list[str] = []
    learningObjectives: list[str] = []
    topicScores: dict[str, float] = {}
    weakTopics: list[str] = []
    lecturerInstructions: str = ""
    classId: str | None = None
    studentId: str | None = None


@router.post("/generate-learning-path", response_model=LearningPathResult)
def post_generate_learning_path(
    payload: GenerateLearningPathPayload,
    background_tasks: BackgroundTasks,
) -> LearningPathResult:
    scope = None
    memory_context = ""
    if payload.classId and payload.studentId:
        scope = student_scope(payload.classId, payload.studentId)
        memory_context = recall_context(
            [
                (scope, "About this student"),
                (lecturer_scope(payload.classId), "Lecturer preferences for this class"),
                (shared_scope(payload.classId), "Common patterns in this class"),
            ],
            f"Build a learning path. Weak topics: {', '.join(payload.weakTopics)}",
        )

    try:
        result = generate_learning_path(
            topics=payload.topics,
            learning_objectives=payload.learningObjectives,
            topic_scores=payload.topicScores,
            weak_topics=payload.weakTopics,
            lecturer_instructions=payload.lecturerInstructions,
            memory_context=memory_context,
        )
    except LearningPathGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if scope:
        fact_text = (
            f"Learning path summary: {result.summary} "
            f"Weak topics: {', '.join(payload.weakTopics) or 'none'}."
        )
        background_tasks.add_task(extract_and_remember, scope, fact_text)

    return result
