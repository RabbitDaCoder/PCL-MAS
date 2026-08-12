// Use-case: a student submits a real question to one of their active classes — this is the
// origin point of the human-in-the-loop workflow (student asks -> lecturer reviews -> responds).
// Requires a completed pre-test, like every other non-chat student feature.
const AppError = require("../../domain/errors/AppError");
const { assertPretestCompleted } = require("../classes/classAccess");

async function submitQuestion(
  { classRepository, questionRepository, assessmentRepository },
  { classId, studentId, questionText },
) {
  const membership = await classRepository.findActiveMembership(
    classId,
    studentId,
  );
  if (!membership) {
    throw new AppError("You don't have access to this class.", 403);
  }
  await assertPretestCompleted(assessmentRepository, classId, studentId);
  if (!questionText || !questionText.trim()) {
    throw new AppError("Question text is required.", 400);
  }

  const question = await questionRepository.create({
    classId,
    studentId,
    questionText: questionText.trim(),
    status: "pending",
  });

  return {
    id: question.id.toString(),
    classId: question.classId.toString(),
    questionText: question.questionText,
    status: question.status,
    lecturerResponse: null,
    respondedAt: null,
    createdAt: question.createdAt,
  };
}

module.exports = submitQuestion;
