// Use-case: a lecturer responds to a question — approving (answered) or rejecting it.
const AppError = require("../../domain/errors/AppError");

async function respondToQuestion(
  { questionRepository },
  { questionId, lecturerId, status, lecturerResponse },
) {
  if (!["answered", "rejected"].includes(status)) {
    throw new AppError("Status must be 'answered' or 'rejected'.", 400);
  }

  const question = await questionRepository.findById(questionId);
  if (!question) {
    throw new AppError("Question not found.", 404);
  }
  if (question.classId.lecturerId.toString() !== lecturerId) {
    throw new AppError("You don't have access to this question.", 403);
  }

  const updated = await questionRepository.update(questionId, {
    status,
    lecturerResponse: lecturerResponse ?? "",
    respondedAt: new Date(),
  });

  return {
    id: updated.id.toString(),
    classId: question.classId.id.toString(),
    className: question.classId.name,
    studentId: question.studentId.toString(),
    questionText: question.questionText,
    status: updated.status,
    lecturerResponse: updated.lecturerResponse,
    respondedAt: updated.respondedAt,
  };
}

module.exports = respondToQuestion;
