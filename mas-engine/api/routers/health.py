# Health check endpoint used to verify the AI service is reachable and see each agent's
# configuration status (never real inference — just whether a provider/model/key is set).
from fastapi import APIRouter

from config.agent_models import get_agent_llm_config

router = APIRouter(tags=["health"])

_AGENTS = ("administrative", "instructor", "lecturer")


@router.get("/health")
def get_health() -> dict:
    agents = {}
    for name in _AGENTS:
        config = get_agent_llm_config(name)
        agents[name] = {
            "configured": config.is_configured,
            "provider": config.provider,
            "model": config.model if config.is_configured else None,
        }
    return {"status": "ok", "agents": agents}
