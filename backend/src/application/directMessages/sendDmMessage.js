// Use-case: student sends a message into their own 1:1 Administrative AI thread. The controller
// triggers the reactive AI reply (same pattern as class-group chat) after responding to this.
const { assertClassAccess } = require("../classes/classAccess");
const { toDmSummary } = require("./getDmThread");

async function sendDmMessage(
  { classRepository, directMessageRepository },
  { classId, studentId, content },
) {
  await assertClassAccess(classRepository, classId, studentId, "student");

  const message = await directMessageRepository.create({
    studentId,
    classId,
    senderType: "student",
    content,
  });
  return toDmSummary(message);
}

module.exports = sendDmMessage;
