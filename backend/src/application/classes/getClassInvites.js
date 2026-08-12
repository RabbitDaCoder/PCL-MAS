// Use-case: a student's pending invites — memberships an existing lecturer has invited them to
// but they haven't accepted yet.
function toInviteSummary(enrollment) {
  const classDoc = enrollment.classId;
  return {
    classId: classDoc?.id?.toString() ?? enrollment.classId?.toString(),
    className: classDoc?.name ?? null,
    courseCode: classDoc?.courseCode ?? null,
    lecturerName: classDoc?.lecturerId
      ? `${classDoc.lecturerId.firstName} ${classDoc.lecturerId.lastName}`
      : null,
    invitedAt: enrollment.createdAt,
  };
}

async function getClassInvites({ classRepository }, { studentId }) {
  const invites = await classRepository.findInvitesByStudent(studentId);
  return invites.filter((invite) => invite.classId).map(toInviteSummary);
}

module.exports = getClassInvites;
