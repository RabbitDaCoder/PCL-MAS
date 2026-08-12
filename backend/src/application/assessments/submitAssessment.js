// Use-case: student submits their answers for an assessment — server computes the score
// (never trusts a client-supplied score) and marks the attempt completed. A student must have
// completed their pre-test before submitting the post-test.
const AppError = require("../../domain/errors/AppError");
const {
  assertClassAccess,
  assertPretestCompleted,
} = require("../classes/classAccess");

const TYPE_MAP = { "pre-test": "pre_test", "post-test": "post_test" };

async function submitAssessment(
  { classRepository, assessmentRepository },
  { classId, userId, role, type, answers },
) {
  const dbType = TYPE_MAP[type];
  if (!dbType) throw new AppError("Invalid assessment type.", 400);
  if (role !== "student") {
    throw new AppError("Only students can submit an assessment.", 403);
  }
  if (!Array.isArray(answers)) {
    throw new AppError("Answers must be an array.", 400);
  }

  await assertClassAccess(classRepository, classId, userId, role);
  if (dbType === "post_test") {
    await assertPretestCompleted(assessmentRepository, classId, userId);
  }

  const assessment = await assessmentRepository.findOne(
    classId,
    userId,
    dbType,
  );
  if (!assessment) {
    throw new AppError("This assessment hasn't been generated yet.", 404);
  }
  if (assessment.status === "completed") {
    throw new AppError("You've already submitted this assessment.", 409);
  }
  if (answers.length !== assessment.questions.length) {
    throw new AppError("Answers must match the number of questions.", 400);
  }

  const correctCount = assessment.questions.reduce(
    (count, question, index) =>
      answers[index] === question.correctAnswer ? count + 1 : count,
    0,
  );
  const score = Math.round((correctCount / assessment.questions.length) * 100);

  assessment.answers = answers;
  assessment.score = score;
  assessment.status = "completed";
  assessment.completedAt = new Date();
  if (!assessment.startedAt) assessment.startedAt = new Date();
  await assessmentRepository.save(assessment);

  return { score, correctCount, totalQuestions: assessment.questions.length };
}

module.exports = submitAssessment;
