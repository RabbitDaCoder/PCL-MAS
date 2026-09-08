// Use-case: lecturer edits the private standing instructions their AI agents follow for this
// class. Deliberately the only writable AI-config surface in the system — a later human-review
// flow will call this same function after an approved change, rather than duplicating the write.
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("./classAccess");

const MAX_LENGTH = 4000;

async function updateClassAiInstructions(
  { classRepository },
  { classId, lecturerId, aiInstructions },
) {
  await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  if (typeof aiInstructions !== "string") {
    throw new AppError("aiInstructions must be a string.", 400);
  }
  const trimmed = aiInstructions.trim().slice(0, MAX_LENGTH);

  const updated = await classRepository.updateAiInstructions(classId, trimmed);
  return { classId: updated.id.toString(), aiInstructions: updated.aiInstructions };
}

module.exports = updateClassAiInstructions;
