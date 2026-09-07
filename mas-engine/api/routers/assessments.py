# Accepts a class's topics/objectives/material URLs and returns a generated set of assessment
# questions (pre-test or post-test) — the Node backend is the caller, not the frontend directly.
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from crews.pretest_crew import AssessmentGenerationError, generate_assessment_questions
from schemas.assessment import AssessmentQuestion
from tools.pdf_extractor import extract_text_from_pdf_urls

router = APIRouter(tags=["assessments"])


class GenerateAssessmentPayload(BaseModel):
    assessmentType: str = "pre-test"
    topics: list[str] = []
    learningObjectives: list[str] = []
    materialUrls: list[str] = []
    materialsText: str = ""
    lecturerInstructions: str = ""
    questionCount: int = 8


class GenerateAssessmentResponse(BaseModel):
    questions: list[AssessmentQuestion]


@router.post("/generate-assessment", response_model=GenerateAssessmentResponse)
def post_generate_assessment(payload: GenerateAssessmentPayload) -> GenerateAssessmentResponse:
    # Prefer already-cached text (extracted at upload time); only download+parse materials that
    # weren't cached yet, so a class with cached materials doesn't re-download anything here.
    downloaded_text = extract_text_from_pdf_urls(payload.materialUrls)
    materials_text = "\n\n".join(filter(None, [payload.materialsText, downloaded_text]))
    try:
        questions = generate_assessment_questions(
            assessment_type=payload.assessmentType,
            topics=payload.topics,
            learning_objectives=payload.learningObjectives,
            materials_text=materials_text,
            lecturer_instructions=payload.lecturerInstructions,
            question_count=payload.questionCount,
        )
    except AssessmentGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return GenerateAssessmentResponse(questions=questions)
