# Accepts a class's topics/objectives/material URLs and returns a generated set of assessment
# questions (pre-test or post-test) — the Node backend is the caller, not the frontend directly.
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from crews.pretest_crew import AssessmentGenerationError, generate_assessment_questions
from memory.pipeline import recall_context
from memory.store import lecturer_scope, shared_scope, student_scope
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
    classId: str | None = None
    studentId: str | None = None


class GenerateAssessmentResponse(BaseModel):
    questions: list[AssessmentQuestion]


@router.post("/generate-assessment", response_model=GenerateAssessmentResponse)
def post_generate_assessment(payload: GenerateAssessmentPayload) -> GenerateAssessmentResponse:
    # Prefer already-cached text (extracted at upload time); only download+parse materials that
    # weren't cached yet, so a class with cached materials doesn't re-download anything here.
    downloaded_text = extract_text_from_pdf_urls(payload.materialUrls)
    materials_text = "\n\n".join(filter(None, [payload.materialsText, downloaded_text]))

    # Recall-only for this surface — a structured question-generation call has low conversational
    # signal to extract afterward, and Node's AIInteraction log already captures it for analysis.
    memory_context = ""
    if payload.classId and payload.studentId:
        memory_context = recall_context(
            [
                (student_scope(payload.classId, payload.studentId), "About this student"),
                (lecturer_scope(payload.classId), "Lecturer preferences for this class"),
                (shared_scope(payload.classId), "Common patterns in this class"),
            ],
            f"Generate a {payload.assessmentType} covering: {', '.join(payload.topics)}",
        )

    try:
        questions = generate_assessment_questions(
            assessment_type=payload.assessmentType,
            topics=payload.topics,
            learning_objectives=payload.learningObjectives,
            materials_text=materials_text,
            lecturer_instructions=payload.lecturerInstructions,
            memory_context=memory_context,
            question_count=payload.questionCount,
        )
    except AssessmentGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return GenerateAssessmentResponse(questions=questions)
