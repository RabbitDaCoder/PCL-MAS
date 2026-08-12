// Use-case: self-serve join by class code — a separate path from lecturer-initiated invites.
// Reactivates a previously-removed membership rather than violating the unique index with a
// duplicate row for the same class+student pair.
const AppError = require("../../domain/errors/AppError");

async function joinClassByCode({ classRepository }, { classCode, studentId }) {
  const classDoc = await classRepository.findByClassCode(classCode);
  if (!classDoc) {
    throw new AppError("Invalid class code.", 404);
  }

  const existing = await classRepository.findMembershipAny(
    classDoc.id,
    studentId,
  );
  if (existing?.status === "active") {
    throw new AppError("You're already in this class.", 409);
  }
  if (existing?.status === "invited") {
    throw new AppError(
      "You have a pending invite for this class — accept it instead.",
      409,
    );
  }

  if (existing?.status === "removed") {
    await classRepository.setMembershipStatus(
      classDoc.id,
      studentId,
      "active",
      {
        joinedAt: new Date(),
      },
    );
  } else {
    await classRepository.addMembership({
      classId: classDoc.id,
      studentId,
      status: "active",
      joinedAt: new Date(),
    });
  }
  await classRepository.incrementStudentCount(classDoc.id, 1);

  return {
    classId: classDoc.id.toString(),
    name: classDoc.name,
    courseCode: classDoc.courseCode,
    status: "active",
  };
}

module.exports = joinClassByCode;
