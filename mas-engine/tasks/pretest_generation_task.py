# Task definition: generate a structured multiple-choice pre/post-test from a class's topics,
# learning objectives, and any uploaded materials' extracted text.
from crewai import Task

_QUESTION_SCHEMA_HINT = (
    "Return ONLY a JSON array (no prose, no markdown fences) of question objects, each shaped "
    'exactly like: {"topic": "<topic name>", "question": "<question text>", '
    '"options": ["<option A>", "<option B>", "<option C>", "<option D>"], "correctIndex": <0-3>}. '
    "Generate exactly {question_count} questions, covering every topic listed at least once."
)


def build_test_generation_task(agent, assessment_type: str) -> Task:
    label = "pre-test" if assessment_type == "pre-test" else "post-test"
    description = (
        f"Generate a {label} for this class.\n\n"
        "Topics: {topics}\n\n"
        "Learning objectives: {learning_objectives}\n\n"
        "Course material excerpts (use these for context/accuracy when present, but you may "
        "still generate reasonable questions from the topics/objectives alone if materials are "
        "empty or thin):\n{materials_text}\n\n"
        "The human lecturer's standing instructions for this class (follow these — they override "
        "your default judgment where they conflict, e.g. difficulty level, tone, question style, "
        "topics to avoid):\n{lecturer_instructions}\n\n"
        "Relevant things you remember about this student and class from past interactions (use "
        "if helpful to calibrate difficulty or focus, ignore if not relevant):\n{memory_context}\n\n"
        + _QUESTION_SCHEMA_HINT
    )
    return Task(
        description=description,
        expected_output=(
            "A JSON array of multiple-choice question objects matching the exact schema "
            "described above — nothing else."
        ),
        agent=agent,
    )
