// Use-case: fetch a student's own 1:1 Administrative AI thread for a class. Student-only — no
// generic lecturer read-all here; lecturer oversight of these DMs would be a separate, explicit
// feature, not a side effect of this one.
const { assertClassAccess } = require("../classes/classAccess");
const { AI_AGENT_DISPLAY_NAMES } = require("../shared/aiAgentDisplayNames");

function toDmSummary(message) {
  return {
    id: message.id.toString(),
    classId: message.classId.toString(),
    senderType: message.senderType,
    aiAgent: message.senderType === "ai" ? (message.aiAgent ?? "Admin") : undefined,
    senderName:
      message.senderType === "ai"
        ? (AI_AGENT_DISPLAY_NAMES[message.aiAgent] ?? "Administrative AI")
        : undefined,
    content: message.content,
    createdAt: message.createdAt,
  };
}

async function getDmThread(
  { classRepository, directMessageRepository },
  { classId, studentId },
) {
  await assertClassAccess(classRepository, classId, studentId, "student");

  const messages = await directMessageRepository.findByStudentAndClass(
    studentId,
    classId,
  );
  return { messages: messages.map(toDmSummary) };
}

module.exports = getDmThread;
module.exports.toDmSummary = toDmSummary;
