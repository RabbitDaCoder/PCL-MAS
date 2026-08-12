// Use-case: the classes the current user belongs to — as the owning lecturer, or as an
// enrolled student. Shapes a small, honest summary; never fabricates data for empty results.
const { ROLES } = require("../../domain/entities/User");

function toLecturerSummary(classDoc) {
  return {
    id: classDoc.id.toString(),
    name: classDoc.name,
    courseCode: classDoc.courseCode,
    studentCount: classDoc.studentCount,
    status: classDoc.status,
    classCode: classDoc.classCode,
  };
}

function toStudentSummary(enrollment) {
  const classDoc = enrollment.classId;
  return {
    id: classDoc.id.toString(),
    name: classDoc.name,
    courseCode: classDoc.courseCode,
    lecturerName: classDoc.lecturerId
      ? `${classDoc.lecturerId.firstName} ${classDoc.lecturerId.lastName}`
      : null,
    status: enrollment.status,
  };
}

async function getMyClasses({ classRepository }, { userId, role }) {
  if (role === ROLES.LECTURER) {
    const classes = await classRepository.findByLecturer(userId);
    return classes.map(toLecturerSummary);
  }

  if (role === ROLES.STUDENT) {
    const enrollments = await classRepository.findEnrollmentsByStudent(userId);
    return enrollments
      .filter((enrollment) => enrollment.classId)
      .map(toStudentSummary);
  }

  return [];
}

module.exports = getMyClasses;
