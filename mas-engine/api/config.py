# Loads and validates environment variables for the AI service, in one place. Per-agent LLM
# config (provider/model/key) lives in config/agent_models.py, not here.
import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.port = int(os.getenv("AI_SERVICE_PORT", os.getenv("PORT", "8000")))
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.backend_base_url = os.getenv("BACKEND_BASE_URL", "http://localhost:4000")


@lru_cache
def get_settings() -> Settings:
    return Settings()
