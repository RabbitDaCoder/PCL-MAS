# Accepts one student's per-topic pre-test scores and returns a personalized learning path.
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from crews.learning_path_crew import (
    LearningPathGenerationError,
    generate_learning_path,
)
from schemas.learning_path import LearningPathResult

router = APIRouter(tags=["learning-path"])


class GenerateLearningPathPayload(BaseModel):
    topics: list[str] = []
    learningObjectives: list[str] = []
    topicScores: dict[str, float] = {}
    weakTopics: list[str] = []


@router.post("/generate-learning-path", response_model=LearningPathResult)
def post_generate_learning_path(
    payload: GenerateLearningPathPayload,
) -> LearningPathResult:
    try:
        return generate_learning_path(
            topics=payload.topics,
            learning_objectives=payload.learningObjectives,
            topic_scores=payload.topicScores,
            weak_topics=payload.weakTopics,
        )
    except LearningPathGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
