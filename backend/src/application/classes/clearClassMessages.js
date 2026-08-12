// Use-case: reset a class chat by clearing all persisted chat messages for that class.
// The API is intentionally student- and lecturer-safe so the instructor or active student can
// start a clean thread without losing the class itself.
const { assertClassAccess } = require("./classAccess");

async function clearClassMessages(
  { classRepository, messageRepository },
  { classId, userId, role },
) {
  await assertClassAccess(classRepository, classId, userId, role);
  await messageRepository.clearByClass(classId);
  return { classId, cleared: true };
}

module.exports = clearClassMessages;
