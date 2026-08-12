// Use-case: lecturer creates an assignment for their class — one row is created per active
// student (sharing a groupId) so each student has their own status/submission/grade.
const crypto = require("crypto");
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("../classes/classAccess");

async function createAssignment(
  { classRepository, assignmentRepository },
  { classId, lecturerId, title, description, instructions, resources, dueDate },
) {
  await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  if (!title) throw new AppError("A title is required.", 400);

  const members = await classRepository.findMembers(classId);
  const activeStudentIds = members
    .filter((member) => member.status === "active")
    .map((member) => member.studentId?._id ?? member.studentId);
  if (activeStudentIds.length === 0) {
    throw new AppError("This class has no active students yet.", 400);
  }

  const groupId = crypto.randomUUID();
  await assignmentRepository.createMany(
    activeStudentIds.map((studentId) => ({
      classId,
      studentId,
      groupId,
      title,
      description,
      instructions,
      resources: Array.isArray(resources) ? resources : [],
      dueDate: dueDate || undefined,
      createdBy: "lecturer",
      status: "pending",
    })),
  );

  return { created: true, groupId, studentCount: activeStudentIds.length };
}

module.exports = createAssignment;
