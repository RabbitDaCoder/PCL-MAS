// Shared ownership guard reused by every lecturer-scoped class use-case — a lecturer may only
// read/write classes they own.
const AppError = require("../../domain/errors/AppError");

async function assertLecturerOwnsClass(classRepository, classId, lecturerId) {
  const classDoc = await classRepository.findById(classId);
  if (!classDoc) {
    throw new AppError("Class not found.", 404);
  }
  if (classDoc.lecturerId.toString() !== lecturerId) {
    throw new AppError("You don't have access to this class.", 403);
  }
  return classDoc;
}

// Shared by endpoints both roles can reach (class detail, chat) — a lecturer must own the class,
// a student must have an ACTIVE membership (invited-but-not-accepted doesn't count).
async function assertClassAccess(classRepository, classId, userId, role) {
  const classDoc = await classRepository.findById(classId);
  if (!classDoc) {
    throw new AppError("Class not found.", 404);
  }
  if (role === "lecturer") {
    if (classDoc.lecturerId.toString() !== userId) {
      throw new AppError("You don't have access to this class.", 403);
    }
    return classDoc;
  }
  if (role === "student") {
    const membership = await classRepository.findActiveMembership(
      classId,
      userId,
    );
    if (!membership) {
      throw new AppError("You don't have access to this class.", 403);
    }
    return classDoc;
  }
  throw new AppError("You don't have access to this class.", 403);
}

// Gates every student-facing feature except chat behind pre-test completion — the
// Administrative AI's onboarding flow tells the student to complete it first.
async function assertPretestCompleted(
  assessmentRepository,
  classId,
  studentId,
) {
  const assessment = await assessmentRepository.findOne(
    classId,
    studentId,
    "pre_test",
  );
  if (!assessment || assessment.status !== "completed") {
    throw new AppError("Complete your pre-test before accessing this.", 403);
  }
}

module.exports = {
  assertLecturerOwnsClass,
  assertClassAccess,
  assertPretestCompleted,
};
