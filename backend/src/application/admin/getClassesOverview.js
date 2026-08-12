// Use-case: all classes for the admin Classes overview. Honest empty list — no class creation
// route exists yet, so this returns [] in practice until that feature ships.
// TODO: replace once class creation ships (add richer per-class stats once there's real data).
function toClassSummary(classDoc) {
  return {
    id: classDoc.id.toString(),
    name: classDoc.name,
    courseCode: classDoc.courseCode,
    status: classDoc.status,
    studentCount: classDoc.studentCount,
    classCode: classDoc.classCode,
    lecturerName: classDoc.lecturerId
      ? `${classDoc.lecturerId.firstName} ${classDoc.lecturerId.lastName}`
      : null,
    createdAt: classDoc.createdAt,
  };
}

async function getClassesOverview({ classRepository }) {
  const classes = await classRepository.findAll();
  return classes.map(toClassSummary);
}

module.exports = getClassesOverview;
