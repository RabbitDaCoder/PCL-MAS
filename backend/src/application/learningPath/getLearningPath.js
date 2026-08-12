// Use-case: fetch a student's learning path (their own, or — for a lecturer — any active
// student's, for the class Progress view). A student must have completed their pre-test.
const AppError = require("../../domain/errors/AppError");
const {
  assertClassAccess,
  assertPretestCompleted,
} = require("../classes/classAccess");

async function getLearningPath(
  { classRepository, learningProfileRepository, assessmentRepository },
  { classId, userId, role, studentId },
) {
  await assertClassAccess(classRepository, classId, userId, role);
  if (role === "student") {
    await assertPretestCompleted(assessmentRepository, classId, userId);
  }

  const targetStudentId = role === "lecturer" ? studentId : userId;
  if (!targetStudentId) {
    throw new AppError("A studentId is required.", 400);
  }

  const profile = await learningProfileRepository.findOne(
    targetStudentId,
    classId,
  );
  if (!profile || !profile.learningPathSteps?.length) {
    return { generated: false };
  }

  // Part G: a student only sees the path once their lecturer has approved it —
  // the lecturer's own view (role === "lecturer") always sees it, review status included.
  if (role === "student" && profile.reviewStatus !== "approved") {
    return { generated: false, pendingReview: true };
  }

  return {
    generated: true,
    summary: profile.progressSummary,
    steps: profile.learningPathSteps,
    lastAssessmentScore: profile.lastAssessmentScore ?? null,
    reviewStatus: profile.reviewStatus ?? null,
  };
}

module.exports = getLearningPath;
