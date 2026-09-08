// Use-case: student rates an AI-authored class-chat message (thumbs up/down + optional note).
const AppError = require("../../domain/errors/AppError");
const { assertClassAccess } = require("./classAccess");
const normalizeMessageFeedback = require("../shared/normalizeMessageFeedback");

async function submitMessageFeedback(
  { classRepository, messageRepository },
  { classId, messageId, studentId, rating, note },
) {
  await assertClassAccess(classRepository, classId, studentId, "student");
  const feedback = normalizeMessageFeedback({ rating, note });

  const updated = await messageRepository.setFeedback(messageId, classId, feedback);
  if (!updated) {
    throw new AppError("Message not found, or not an AI-authored message.", 404);
  }
  return { id: updated.id.toString(), feedback: updated.feedback };
}

module.exports = submitMessageFeedback;
