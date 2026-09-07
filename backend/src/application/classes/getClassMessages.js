// Use-case: paginated message history for a class's chat — REST source of truth so history
// survives even if a client's socket briefly drops. Owner lecturer or an active student member.
const { assertClassAccess } = require("./classAccess");
const { AI_AGENT_DISPLAY_NAMES } = require("../shared/aiAgentDisplayNames");

function toMessageSummary(message) {
  const sender = message.senderId;
  return {
    id: message.id.toString(),
    classId: message.classId.toString(),
    senderId: sender?.id?.toString() ?? message.senderId?.toString() ?? null,
    senderName: sender
      ? `${sender.firstName} ${sender.lastName}`
      : message.senderType === "ai"
        ? (AI_AGENT_DISPLAY_NAMES[message.aiAgent] ?? "Administrative AI")
        : "System",
    senderRole: message.senderType,
    aiAgent: message.senderType === "ai" ? (message.aiAgent ?? "Admin") : undefined,
    content: message.content,
    createdAt: message.createdAt,
  };
}

async function getClassMessages(
  { classRepository, messageRepository },
  { classId, userId, role, page = 1, limit = 50 },
) {
  await assertClassAccess(classRepository, classId, userId, role);

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));

  const { messages, total } = await messageRepository.findByClass(
    classId,
    safePage,
    safeLimit,
  );
  return {
    messages: messages.map(toMessageSummary),
    total,
    page: safePage,
    limit: safeLimit,
  };
}

module.exports = getClassMessages;
module.exports.toMessageSummary = toMessageSummary;
