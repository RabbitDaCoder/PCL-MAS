// Use-case: invite a student by email. If they already have an account, a membership is created
// with status "invited" (they must accept before it counts); otherwise a pending invite by email
// is stored (no account yet, no email actually sent).
const AppError = require("../../domain/errors/AppError");
const { ROLES } = require("../../domain/entities/User");
const { assertLecturerOwnsClass } = require("./classAccess");

async function inviteStudent(
  { classRepository, userRepository },
  { classId, lecturerId, email },
) {
  await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  const normalizedEmail = email.toLowerCase();
  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    if (existingUser.role !== ROLES.STUDENT) {
      throw new AppError("Only student accounts can be invited.", 400);
    }
    const existingMembership = await classRepository.findMembershipByStudentId(
      classId,
      existingUser.id,
    );
    if (existingMembership) {
      throw new AppError("This student is already in the class.", 409);
    }
    await classRepository.addMembership({
      classId,
      studentId: existingUser.id,
      status: "invited",
    });
    return { status: "invited" };
  }

  const existingInvite = await classRepository.findMembershipByEmail(
    classId,
    normalizedEmail,
  );
  if (existingInvite) {
    throw new AppError("This email has already been invited.", 409);
  }
  await classRepository.addMembership({
    classId,
    inviteEmail: normalizedEmail,
    status: "pending",
  });
  return { status: "pending" };
}

module.exports = inviteStudent;
