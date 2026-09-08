# Memory recall/extraction operations shared across every mas-engine entry point that touches
# Memory. Every function here is safe to call even when Memory is disabled (embeddings
# unconfigured) — recall returns an empty string, extraction is a silent no-op. Neither function
# ever raises; a memory failure must never break the primary AI response it's attached to.
from memory.store import get_memory

_RECALL_LIMIT_PER_SCOPE = 5


def recall_context(scopes: list[tuple[str, str]], query: str) -> str:
    """scopes: (scope_path, label) pairs, e.g. (student_scope(...), "About this student").
    Returns a formatted, labeled block of recalled memories so the LLM knows what kind of memory
    each item is, or "" if memory is disabled, nothing matched, or recall failed."""
    memory = get_memory()
    if memory is None:
        return ""

    sections = []
    for scope_path, label in scopes:
        try:
            matches = memory.recall(query, scope=scope_path, limit=_RECALL_LIMIT_PER_SCOPE)
        except Exception:
            continue
        if not matches:
            continue
        bullets = "\n".join(f"- {match.record.content}" for match in matches)
        sections.append(f"{label}:\n{bullets}")

    if not sections:
        return ""
    return "\n\n".join(sections)


def extract_and_remember(scope: str, text: str) -> None:
    """Meant for FastAPI's BackgroundTasks — runs after the response is already sent, so it can
    never add latency or fail a request. Silently no-ops if memory is disabled, text is empty,
    or extraction fails for any reason."""
    memory = get_memory()
    if memory is None or not text:
        return
    try:
        facts = memory.extract_memories(text)
        for fact in facts:
            memory.remember(fact, scope=scope)
    except Exception:
        pass
