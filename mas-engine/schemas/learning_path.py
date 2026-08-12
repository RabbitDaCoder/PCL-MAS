# Structured schema for a generated learning path — a short summary plus prioritized topic steps.
import json
import re
from typing import Literal

from pydantic import BaseModel, TypeAdapter


class LearningPathStep(BaseModel):
    topic: str
    priority: Literal["high", "medium", "low"]
    recommendation: str


class LearningPathResult(BaseModel):
    summary: str
    steps: list[LearningPathStep]


_result_adapter = TypeAdapter(LearningPathResult)


def extract_json_object(text: str) -> str:
    """Strips markdown code fences and returns the first top-level JSON object found in `text`."""
    stripped = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE)
    start = stripped.find("{")
    end = stripped.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ValueError("No JSON object found in the model output.")
    return stripped[start : end + 1]


def parse_learning_path(raw_text: str) -> LearningPathResult:
    """Parses and validates raw LLM output into a LearningPathResult. Raises ValueError (never a
    raw json/pydantic exception) on any failure, so callers can catch one error type."""
    try:
        json_object = extract_json_object(raw_text)
        data = json.loads(json_object)
        return _result_adapter.validate_python(data)
    except Exception as exc:
        raise ValueError(f"Couldn't parse a valid learning path: {exc}") from exc
