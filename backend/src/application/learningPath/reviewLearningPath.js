// Use-case: lecturer approves or rejects a student's AI-generated learning path (Part G,
// human-in-the-loop review). Approve makes it visible to the student as-is; reject discards it
// and immediately regenerates a fresh one (left pending, awaiting the next review).
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("../classes/classAccess");
const { runLearningPathGeneration } = require("./generateLearningPath");

async function reviewLearningPath(
  { classRepository, assessmentRepository, learningProfileRepository },
  { classId, lecturerId, studentId, decision },
) {
  await assertLecturerOwnsClass(classRepository, classId, lecturerId);
  if (!studentId) {
    throw new AppError("A studentId is required.", 400);
  }
  if (decision !== "approve" && decision !== "reject") {
    throw new AppError('decision must be "approve" or "reject".', 400);
  }

  const profile = await learningProfileRepository.findOne(studentId, classId);
  if (!profile || !profile.learningPathSteps?.length) {
    throw new AppError("This student has no learning path to review.", 404);
  }

  if (decision === "approve") {
    await learningProfileRepository.upsert(studentId, classId, {
      reviewStatus: "approved",
      reviewedAt: new Date(),
      reviewedBy: lecturerId,
    });
    return { reviewStatus: "approved" };
  }

  // Reject: regenerate immediately rather than leaving the student with nothing.
  await runLearningPathGeneration(
    { classRepository, assessmentRepository, learningProfileRepository },
    { classId, studentId },
  );
  await learningProfileRepository.upsert(studentId, classId, {
    reviewedAt: new Date(),
    reviewedBy: lecturerId,
  });
  return { reviewStatus: "pending" };
}

module.exports = reviewLearningPath;
