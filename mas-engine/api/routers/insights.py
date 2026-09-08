# Two endpoints for the human-review improvement loop:
#   - /generate-insights: turns aggregated performance data into review-ready suggestions.
#   - /preview-reply: a sandboxed dry-run reply using a candidate instructions text, so a
#     lecturer can see the effect of a change before applying it. Deliberately calls
#     run_request directly (a pure function with no persistence side effects) and never touches
#     memory or Node's conversation storage — nothing here can leak into real student history.
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from crews.insight_crew import InsightGenerationError, generate_insights
from flows.orchestrator import run_request
from schemas.insight import Insight

router = APIRouter(tags=["insights"])


class GenerateInsightsPayload(BaseModel):
    topics: list[str] = []
    metricsSummary: str


class GenerateInsightsResponse(BaseModel):
    insights: list[Insight]


@router.post("/generate-insights", response_model=GenerateInsightsResponse)
def post_generate_insights(payload: GenerateInsightsPayload) -> GenerateInsightsResponse:
    try:
        insights = generate_insights(topics=payload.topics, metrics_summary=payload.metricsSummary)
    except InsightGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return GenerateInsightsResponse(insights=insights)


class PreviewReplyPayload(BaseModel):
    candidateInstructions: str
    samplePrompt: str = "Can you help me understand the hardest topic in this class?"
    topics: list[str] = []
    learningObjectives: list[str] = []
    materialsExcerpt: str = ""


class PreviewReplyResponse(BaseModel):
    turns: list[dict]


@router.post("/preview-reply", response_model=PreviewReplyResponse)
def post_preview_reply(payload: PreviewReplyPayload) -> PreviewReplyResponse:
    request_text = (
        f'A student sent this message in the class chat: "{payload.samplePrompt}"\n\n'
        "Address the student naturally as whichever agent best fits their message.\n\n"
        f"Class topics: {', '.join(payload.topics) or 'none listed'}. "
        f"Learning objectives: {', '.join(payload.learningObjectives) or 'none listed'}."
        + (
            "\n\nCourse material excerpts for this class (use these as the source of truth for "
            f"teaching content and questions about the course):\n{payload.materialsExcerpt}"
            if payload.materialsExcerpt
            else ""
        )
        + "\n\nThe human lecturer's standing instructions for how their AI agents should behave "
        f"in this class (follow these; they override your default judgment where they "
        f"conflict):\n{payload.candidateInstructions}"
    )
    turns = run_request(request_text)
    return PreviewReplyResponse(turns=turns)
