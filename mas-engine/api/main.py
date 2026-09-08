# FastAPI application entry point: wires routers only, no business logic here.
# FastAPI auto-generates OpenAPI/Swagger UI at /docs and ReDoc at /redoc.
from fastapi import FastAPI

from api.routers import (
    assessments,
    health,
    insights,
    learning_path,
    materials,
    memory,
    onboarding,
    requests,
)

app = FastAPI(
    title="PCL-MAS AI Service",
    version="1.0.0",
    description="Internal HTTP interface the Node backend calls to reach the CrewAI orchestrator. Not exposed to the frontend directly.",
)

app.include_router(health.router, prefix="/api")
# Also mounted bare at /health — that's the path the Node backend's reachability check calls.
app.include_router(health.router)
app.include_router(requests.router, prefix="/api")
app.include_router(assessments.router, prefix="/api")
app.include_router(learning_path.router, prefix="/api")
app.include_router(materials.router, prefix="/api")
app.include_router(onboarding.router, prefix="/api")
app.include_router(memory.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
