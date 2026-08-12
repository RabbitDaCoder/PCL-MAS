// Use-case: a student's own list of assignments for a class (requires a completed pre-test).
const {
  assertClassAccess,
  assertPretestCompleted,
} = require("../classes/classAccess");

function toAssignmentSummary(doc) {
  return {
    id: doc.id.toString(),
    groupId: doc.groupId,
    title: doc.title,
    description: doc.description ?? "",
    instructions: doc.instructions ?? "",
    resources: doc.resources ?? [],
    dueDate: doc.dueDate,
    status: doc.status,
    submissionText: doc.submissionText ?? "",
    submissionFileUrl: doc.submissionFileUrl ?? null,
    submittedAt: doc.submittedAt ?? null,
    score: doc.score ?? null,
    feedback: doc.feedback ?? "",
  };
}

async function getStudentAssignments(
  { classRepository, assignmentRepository, assessmentRepository },
  { classId, studentId },
) {
  await assertClassAccess(classRepository, classId, studentId, "student");
  await assertPretestCompleted(assessmentRepository, classId, studentId);

  const docs = await assignmentRepository.findByClassAndStudent(
    classId,
    studentId,
  );
  return docs.map(toAssignmentSummary);
}

module.exports = getStudentAssignments;
