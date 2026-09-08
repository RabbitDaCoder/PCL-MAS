// Fire-and-forget: sends a lecturer's free-text review feedback to mas-engine, which remembers
// it as a lecturer-preference fact for that class. Never throws — a failed memory write must
// never affect the lecturer's own review action, which has already succeeded. Shared by the
// assessment and learning-path review controllers, since the call is identical either way.
const env = require("../../config/env");

const REQUEST_TIMEOUT_MS = 15000;

async function rememberLecturerFeedback(classId, feedbackText) {
  if (!feedbackText) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    await fetch(`${env.aiServiceBaseUrl}/api/remember-lecturer-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ classId, feedbackText }),
    });
  } catch {
    // Best-effort — errors here must never surface to the lecturer.
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = rememberLecturerFeedback;
