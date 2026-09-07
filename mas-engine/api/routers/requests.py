# Accepts a request from the backend and routes it through the orchestrator Crew.
from fastapi import APIRouter
from pydantic import BaseModel

from flows.orchestrator import run_request

router = APIRouter(tags=["requests"])


class RequestPayload(BaseModel):
    request: str


class ChatTurnResponse(BaseModel):
    agent: str
    message: str


class RequestResponse(BaseModel):
    turns: list[ChatTurnResponse]


@router.post("/requests", response_model=RequestResponse)
def post_request(payload: RequestPayload) -> RequestResponse:
    turns = run_request(payload.request)
    return RequestResponse(turns=turns)
