// Shared validation for the student thumbs-up/down + note feedback on AI-authored messages —
// used by both the class-chat and 1:1 DM feedback use-cases.
const AppError = require("../../domain/errors/AppError");

function normalizeMessageFeedback({ rating, note }) {
  if (rating !== "up" && rating !== "down") {
    throw new AppError('rating must be "up" or "down".', 400);
  }
  return {
    rating,
    note: typeof note === "string" ? note.trim().slice(0, 1000) : undefined,
    createdAt: new Date(),
  };
}

module.exports = normalizeMessageFeedback;
