// Use-case: the enrolled/pending-invited students for a class, owner-only.
const { assertLecturerOwnsClass } = require("./classAccess");

function toMemberSummary(enrollment) {
  const student = enrollment.studentId;
  return {
    id: enrollment.id.toString(),
    studentId: student ? student.id.toString() : null,
    firstName: student?.firstName ?? null,
    lastName: student?.lastName ?? null,
    email: student?.email ?? enrollment.inviteEmail,
    status: enrollment.status,
    joinedAt: enrollment.joinedAt,
  };
}

async function getClassStudents({ classRepository }, { classId, lecturerId }) {
  await assertLecturerOwnsClass(classRepository, classId, lecturerId);
  const members = await classRepository.findMembers(classId);
  return members.map(toMemberSummary);
}

module.exports = getClassStudents;
