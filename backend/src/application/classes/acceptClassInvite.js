// Use-case: a student accepts a lecturer's invite — membership goes from "invited" to "active".
// The controller follows this up with a socket room join + class:membership:update emit.
const AppError = require("../../domain/errors/AppError");

async function acceptClassInvite({ classRepository }, { classId, studentId }) {
  const membership = await classRepository.findMembershipByStudentId(
    classId,
    studentId,
  );
  if (!membership || membership.status !== "invited") {
    throw new AppError("No pending invite found for this class.", 404);
  }

  await classRepository.setMembershipStatus(classId, studentId, "active", {
    joinedAt: new Date(),
  });
  await classRepository.incrementStudentCount(classId, 1);

  return { classId: classId.toString(), status: "active" };
}

module.exports = acceptClassInvite;
