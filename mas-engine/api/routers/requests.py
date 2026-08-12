# Accepts a request from the backend and routes it through the orchestrator Crew.
from fastapi import APIRouter
from pydantic import BaseModel

from flows.orchestrator import run_request

router = APIRouter(tags=["requests"])


class RequestPayload(BaseModel):
    request: str


class RequestResponse(BaseModel):
    response: str


@router.post("/requests", response_model=RequestResponse)
def post_request(payload: RequestPayload) -> RequestResponse:
    result = run_request(payload.request)
    return RequestResponse(response=result)
