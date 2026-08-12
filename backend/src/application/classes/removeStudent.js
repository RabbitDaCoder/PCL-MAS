// Use-case: remove an active/pending student from a class (soft-remove, owner-only).
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("./classAccess");

async function removeStudent(
  { classRepository },
  { classId, lecturerId, studentId },
) {
  await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  const membership = await classRepository.findMembershipByStudentId(
    classId,
    studentId,
  );
  if (!membership) {
    throw new AppError("Student not found in this class.", 404);
  }

  await classRepository.removeMembership(classId, studentId);
  if (membership.status === "active") {
    await classRepository.incrementStudentCount(classId, -1);
  }
}

module.exports = removeStudent;
