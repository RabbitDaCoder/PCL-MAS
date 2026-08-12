# PCL-MAS AI Service (mas-engine)

Python + FastAPI + CrewAI service, fully independent from the Node backend — communication happens only over HTTP.

## Structure

```
api/
  main.py            FastAPI app entry point (wires routers only)
  config.py           Settings (env-driven: AI_SERVICE_PORT, ENVIRONMENT, BACKEND_BASE_URL, DB_*)
  routers/
    health.py         GET /health (and /api/health) — per-agent configured/provider status
    requests.py       POST /api/requests -> routes through the orchestrator Crew
config/
  agent_models.py      get_agent_llm_config(agent_name) — reads each agent's own PROVIDER/MODEL/API_KEY env vars
providers/
  llm_factory.py       build_llm_for_agent(agent_name) — real LLM if configured, else a labeled MockLLM
agents/
  Admin/, Instructor/, Lecturer/   agent.yaml definitions (role/goal/backstory)
  loader.py            build_agent(folder_name, key, llm)
flows/
  orchestrator.py      build_orchestrator_crew() — single hierarchical Crew, one LLM per agent via llm_factory
memory/, tasks/, tools/  scaffolding for future agent tooling/memory
```

## Running

```
# from mas-engine/, with .venv activated
uvicorn api.main:app --reload --port 8000
```

Requires `mas-engine/.env` (see `.env.example`): per-agent `ADMIN_AGENT_*`/`INSTRUCTOR_AGENT_*`/
`LECTURER_AGENT_*` (`_PROVIDER`, `_MODEL`, `_API_KEY`), optional `DEFAULT_PROVIDER`/`DEFAULT_API_KEY`
fallback, `AI_SERVICE_PORT`, `BACKEND_BASE_URL`, `ENVIRONMENT`, `DB_*`. The service starts cleanly
with all agent keys blank — every agent just reports `configured: false` and runs through `MockLLM`
until a real provider/model/key is set for it.

## API docs (Swagger / OpenAPI)

FastAPI auto-generates interactive docs — no manual annotation needed:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Raw OpenAPI JSON: `http://localhost:8000/openapi.json`

## Current endpoints

- `GET /health` (and `GET /api/health`) — liveness + per-agent `{ configured, provider }` status
- `POST /api/requests` — `{ request: string }` -> runs the orchestrator Crew, returns `{ response: string }`

## Status

Orchestrator Crew (`Process.hierarchical`, Admin/Instructor/Lecturer agents each with their own LLM
via `providers/llm_factory.py`, manager LLM = Administrative agent's LLM) is wired but only has a
generic routing task so far. Not yet implemented: Approval Gateway (risk-based human-in-the-loop
hand-off), per-agent tasks/tools beyond routing, persistent memory backing, real provider wiring
beyond the factory boundary. The Node backend must never call CrewAI directly — all access goes
through this service's HTTP API.
