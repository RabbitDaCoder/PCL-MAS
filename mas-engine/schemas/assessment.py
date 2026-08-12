# Structured schema for generated assessment questions — shared by pre-test and post-test
# generation, and used to validate the Instructor Agent's raw LLM output before it's trusted.
import json
import re

from pydantic import BaseModel, Field, TypeAdapter, field_validator


class AssessmentQuestion(BaseModel):
    topic: str
    question: str
    options: list[str] = Field(min_length=4, max_length=4)
    correctIndex: int

    @field_validator("correctIndex")
    @classmethod
    def correct_index_in_range(cls, value: int) -> int:
        if value < 0 or value > 3:
            raise ValueError("correctIndex must be between 0 and 3")
        return value


_questions_adapter = TypeAdapter(list[AssessmentQuestion])


def extract_json_array(text: str) -> str:
    """Strips markdown code fences and returns the first top-level JSON array found in `text`."""
    stripped = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE)
    start = stripped.find("[")
    end = stripped.rfind("]")
    if start == -1 or end == -1 or end < start:
        raise ValueError("No JSON array found in the model output.")
    return stripped[start : end + 1]


def parse_questions(raw_text: str) -> list[AssessmentQuestion]:
    """Parses and validates raw LLM output into a list of AssessmentQuestion. Raises ValueError
    (never a raw json/pydantic exception) on any failure, so callers can catch one error type."""
    try:
        json_array = extract_json_array(raw_text)
        data = json.loads(json_array)
        return _questions_adapter.validate_python(data)
    except Exception as exc:
        raise ValueError(f"Couldn't parse a valid question set: {exc}") from exc
