// Use-case: persist a chat message. The controller emits the socket event after this succeeds —
// single write path (REST persists, REST triggers the emit), no separate client->server socket path.
const { assertClassAccess } = require("./classAccess");
const { toMessageSummary } = require("./getClassMessages");

async function sendClassMessage(
  { classRepository, messageRepository },
  { classId, userId, role, senderRole, content },
) {
  await assertClassAccess(classRepository, classId, userId, role);

  const message = await messageRepository.create({
    classId,
    senderId: userId,
    senderType: senderRole,
    content,
    messageType: "text",
  });
  return toMessageSummary(message);
}

module.exports = sendClassMessage;
