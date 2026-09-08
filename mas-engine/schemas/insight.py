# Structured schema for improvement insights — used to validate the Improvement Analyst's raw
# LLM output before it's trusted. Deliberately constrained to plain strings: nothing here can
# represent code, file paths, or anything executable, so even a hallucinating LLM can only ever
# produce a suggestion, never a mechanism for applying it.
import json
import re

from pydantic import BaseModel, Field, TypeAdapter

_MAX_INSIGHTS = 5


class Insight(BaseModel):
    title: str
    evidence: str
    # Literal, appendable text for Class.aiInstructions — not a vague description — so it's
    # directly usable in the human-review UI without the lecturer having to translate it.
    suggestedInstructionText: str
    severity: str = Field(pattern="^(low|medium|high)$")


_insights_adapter = TypeAdapter(list[Insight])


def extract_json_array(text: str) -> str:
    """Strips markdown code fences and returns the first top-level JSON array found in `text`."""
    stripped = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE)
    start = stripped.find("[")
    end = stripped.rfind("]")
    if start == -1 or end == -1 or end < start:
        raise ValueError("No JSON array found in the model output.")
    return stripped[start : end + 1]


def parse_insights(raw_text: str) -> list[Insight]:
    """Parses and validates raw LLM output into a list of Insight, capped at _MAX_INSIGHTS so a
    lecturer is never handed an overwhelming review queue. Raises ValueError (never a raw
    json/pydantic exception) on any failure, so callers can catch one error type."""
    try:
        json_array = extract_json_array(raw_text)
        data = json.loads(json_array)
        insights = _insights_adapter.validate_python(data)
        return insights[:_MAX_INSIGHTS]
    except Exception as exc:
        raise ValueError(f"Couldn't parse a valid insight list: {exc}") from exc
