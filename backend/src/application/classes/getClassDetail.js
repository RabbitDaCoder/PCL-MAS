// Use-case: the class workspace header — name/course code/description/student count. Owner
// lecturer, or a student with an active membership.
const { assertClassAccess } = require("./classAccess");

async function getClassDetail({ classRepository }, { classId, userId, role }) {
  const classDoc = await assertClassAccess(
    classRepository,
    classId,
    userId,
    role,
  );
  return {
    id: classDoc.id.toString(),
    name: classDoc.name,
    courseCode: classDoc.courseCode,
    description: classDoc.description ?? "",
    studentCount: classDoc.studentCount,
    status: classDoc.status,
    classCode: classDoc.classCode,
    createdAt: classDoc.createdAt,
  };
}

module.exports = getClassDetail;
