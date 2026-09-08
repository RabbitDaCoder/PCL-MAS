# Task definition: turn aggregated per-class performance data into a short, evidence-backed list
# of improvement suggestions.
from crewai import Task

_INSIGHT_SCHEMA_HINT = (
    "Return ONLY a JSON array (no prose, no markdown fences) of insight objects, each shaped "
    'exactly like: {"title": "<short label>", "evidence": "<1-3 sentences citing the specific '
    'data that led you here>", "suggestedInstructionText": "<literal instruction text a lecturer '
    'could paste into their class\'s AI instructions to address this>", "severity": '
    '"low"|"medium"|"high"}. Return at most 5 insights. If the evidence only really supports '
    "1 or 2 solid suggestions, return only that many — do not pad the list with weak or "
    "speculative ones."
)


def build_insight_generation_task(agent) -> Task:
    description = (
        "Analyze this class's AI agent performance data and propose concrete improvements.\n\n"
        "Class topics: {topics}\n\n"
        "Performance data:\n{metrics_summary}\n\n"
        "Every suggestion must be traceable to something specific in the data above — a review "
        "rejection reason, a pattern in student feedback notes, a cluster of thumbs-down replies. "
        "Do not suggest anything you can't point to direct evidence for.\n\n" + _INSIGHT_SCHEMA_HINT
    )
    return Task(
        description=description,
        expected_output=(
            "A JSON array of insight objects matching the exact schema described above — "
            "nothing else."
        ),
        agent=agent,
    )
