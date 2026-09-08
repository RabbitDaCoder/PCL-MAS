// Use-case: student rates an AI-authored message in their private 1:1 thread (thumbs up/down +
// optional note).
const AppError = require("../../domain/errors/AppError");
const { assertClassAccess } = require("../classes/classAccess");
const normalizeMessageFeedback = require("../shared/normalizeMessageFeedback");

async function submitDmMessageFeedback(
  { classRepository, directMessageRepository },
  { classId, messageId, studentId, rating, note },
) {
  await assertClassAccess(classRepository, classId, studentId, "student");
  const feedback = normalizeMessageFeedback({ rating, note });

  const updated = await directMessageRepository.setFeedback(
    messageId,
    studentId,
    feedback,
  );
  if (!updated) {
    throw new AppError("Message not found, or not an AI-authored message.", 404);
  }
  return { id: updated.id.toString(), feedback: updated.feedback };
}

module.exports = submitDmMessageFeedback;
