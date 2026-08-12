# Loads an agent's role/goal/backstory definition from its agent.yaml and builds a crewai Agent.
from pathlib import Path

import yaml
from crewai import Agent, LLM

_AGENTS_DIR = Path(__file__).parent


def _load_definition(folder_name: str, key: str) -> dict:
    path = _AGENTS_DIR / folder_name / "agent.yaml"
    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data[key]


def build_agent(folder_name: str, key: str, llm: LLM, allow_delegation: bool = False) -> Agent:
    definition = _load_definition(folder_name, key)
    return Agent(
        role=definition["role"].strip(),
        goal=definition["goal"].strip(),
        backstory=definition["backstory"].strip(),
        llm=llm,
        allow_delegation=allow_delegation,
        verbose=True,
    )
