// Use-case: lecturer's list of assignments for a class — one row per groupId (assignment
// definition), with per-student submission/grade status folded in.
const { assertLecturerOwnsClass } = require("../classes/classAccess");

function toStudentStatus(doc) {
  const student = doc.studentId;
  return {
    assignmentId: doc.id.toString(),
    studentId: student?._id?.toString() ?? student?.toString(),
    firstName: student?.firstName ?? null,
    lastName: student?.lastName ?? null,
    status: doc.status,
    score: doc.score ?? null,
    submittedAt: doc.submittedAt ?? null,
  };
}

async function getClassAssignments(
  { classRepository, assignmentRepository },
  { classId, lecturerId },
) {
  await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  const docs = await assignmentRepository.findByClass(classId);

  const groups = new Map();
  for (const doc of docs) {
    if (!groups.has(doc.groupId)) {
      groups.set(doc.groupId, {
        groupId: doc.groupId,
        title: doc.title,
        description: doc.description ?? "",
        instructions: doc.instructions ?? "",
        resources: doc.resources ?? [],
        dueDate: doc.dueDate,
        createdAt: doc.createdAt,
        students: [],
      });
    }
    groups.get(doc.groupId).students.push(toStudentStatus(doc));
  }

  return Array.from(groups.values())
    .map((group) => {
      const totalStudents = group.students.length;
      const submittedCount = group.students.filter(
        (s) => s.status === "submitted" || s.status === "graded",
      ).length;
      const gradedCount = group.students.filter(
        (s) => s.status === "graded",
      ).length;
      const gradedScores = group.students
        .filter((s) => s.status === "graded" && typeof s.score === "number")
        .map((s) => s.score);
      const averageScore = gradedScores.length
        ? Math.round(
            gradedScores.reduce((sum, score) => sum + score, 0) /
              gradedScores.length,
          )
        : null;
      return {
        ...group,
        totalStudents,
        submittedCount,
        gradedCount,
        averageScore,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = getClassAssignments;
