# Accepts summarized onboarding context from the Node backend (never raw user documents) and
# returns a generated 1:1 welcome message for the Administrative AI's DM thread with a student.
from fastapi import APIRouter
from pydantic import BaseModel

from crews.onboarding_crew import generate_onboarding_message

router = APIRouter(tags=["onboarding"])


class OnboardingPayload(BaseModel):
    studentFirstName: str
    className: str
    topics: list[str] = []
    learningObjectives: list[str] = []
    pretestStatus: str = "not_started"


class OnboardingResponse(BaseModel):
    message: str


@router.post("/generate-onboarding-message", response_model=OnboardingResponse)
def post_generate_onboarding_message(payload: OnboardingPayload) -> OnboardingResponse:
    message = generate_onboarding_message(
        student_first_name=payload.studentFirstName,
        class_name=payload.className,
        topics=payload.topics,
        learning_objectives=payload.learningObjectives,
        pretest_status=payload.pretestStatus,
    )
    return OnboardingResponse(message=message)
