// Fire-and-forget: once the human lecturer approves a pre-test/post-test, posts an
// Instructor-AI-authored announcement into the class chat so the release ("drop") is a visible,
// automated event — not just a silent reviewStatus flip. Never throws — a failed announcement
// must never break the lecturer's own review action, which has already succeeded.
const { toMessageSummary } = require("../classes/getClassMessages");

const ANNOUNCEMENT_TEXT = {
  "pre-test":
    "Your pre-test is ready! Head to the class workspace to take it — your results shape your personalized learning path.",
  "post-test": "Your post-test is now available in the class workspace.",
};

async function announceAssessmentRelease(
  { messageRepository },
  { classId, type },
  { emitClassMessage },
) {
  try {
    const content = ANNOUNCEMENT_TEXT[type];
    if (!content) return;

    const message = await messageRepository.create({
      classId,
      senderType: "ai",
      aiAgent: "Instructor",
      content,
      messageType: "ai_response",
    });
    emitClassMessage(classId, toMessageSummary(message));
  } catch {
    // Best-effort — errors here must never surface to the lecturer.
  }
}

module.exports = announceAssessmentRelease;
