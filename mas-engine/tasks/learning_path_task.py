# Task definition: generate a personalized learning path from a student's per-topic pre-test
# performance — this is instructional planning, so the Instructor Agent (not the Lecturer Agent,
# which only reviews) owns generation.
from crewai import Task

_SCHEMA_HINT = (
    "Return ONLY a JSON object (no prose, no markdown fences) shaped exactly like: "
    '{"summary": "<2-3 sentence plain-language summary of where the student stands>", '
    '"steps": [{"topic": "<topic name>", "priority": "high"|"medium"|"low", '
    '"recommendation": "<1-2 sentence, specific, actionable recommendation>"}]}. '
    "Include one step per topic listed, ordered with the highest-priority (weakest) topics first."
)


def build_learning_path_task(agent) -> Task:
    description = (
        "Build a personalized learning path for one student in this class, based on their "
        "pre-test performance.\n\n"
        "Class topics: {topics}\n\n"
        "Learning objectives: {learning_objectives}\n\n"
        "Per-topic pre-test scores (0-100): {topic_scores}\n\n"
        "Topics the student is weakest in: {weak_topics}\n\n"
        "The human lecturer's standing instructions for this class (follow these — they override "
        "your default judgment where they conflict, e.g. tone, pacing, how directive to be):\n"
        "{lecturer_instructions}\n\n" + _SCHEMA_HINT
    )
    return Task(
        description=description,
        expected_output=(
            "A JSON object with a summary string and a steps array matching the exact schema "
            "described above — nothing else."
        ),
        agent=agent,
    )
