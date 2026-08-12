# Task definition: generate a short, warm 1:1 onboarding greeting for a student who just joined
# a class — names them, briefly covers what they'll learn, and points them to the pre-test.
from crewai import Task

_STYLE_HINT = (
    "Keep it to 3-4 short sentences — this is a warm welcome message, not a syllabus dump. "
    'Return ONLY the message text itself (no JSON, no markdown fences, no "Here is..." preamble).'
)


def build_onboarding_dm_task(agent) -> Task:
    description = (
        "Write a personal, 1:1 welcome message to a student who just joined your class.\n\n"
        "Student's first name: {student_first_name}\n"
        "Class name: {class_name}\n"
        "Topics: {topics}\n"
        "Learning objectives: {learning_objectives}\n"
        "Student's pre-test status: {pretest_status}\n\n"
        "Greet them by first name, briefly mention what they'll be learning in this class "
        "(from the topics/objectives), and let them know a pre-test is ready for them to take "
        "before they can access the rest of the class — don't paste a raw link, just mention it "
        "exists and invite them to take it (the app will show a real button for that). "
        + _STYLE_HINT
    )
    return Task(
        description=description,
        expected_output="The onboarding message text, nothing else.",
        agent=agent,
    )
