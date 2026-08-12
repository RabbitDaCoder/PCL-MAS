// Use-case: a student's own Progress view for one class — same shape as the lecturer's
// per-student entry, scoped to the requesting student only (requires a completed pre-test).
const {
  assertClassAccess,
  assertPretestCompleted,
} = require("../classes/classAccess");
const {
  buildProgressEntries,
  buildAssessmentsByStudent,
  buildAssignmentsByStudent,
} = require("./buildProgressEntries");

async function getMyProgress(deps, { classId, studentId }) {
  const {
    classRepository,
    messageRepository,
    questionRepository,
    learningProfileRepository,
    assessmentRepository,
    assignmentRepository,
  } = deps;

  await assertClassAccess(classRepository, classId, studentId, "student");
  await assertPretestCompleted(assessmentRepository, classId, studentId);

  const [
    members,
    messageStats,
    questionStats,
    profile,
    preTest,
    postTest,
    assignments,
  ] = await Promise.all([
    classRepository.findMembers(classId),
    messageRepository.getStudentEngagementByClass(classId),
    questionRepository.getStudentEngagementByClass(classId),
    learningProfileRepository.findOne(studentId, classId),
    assessmentRepository.findOne(classId, studentId, "pre_test"),
    assessmentRepository.findOne(classId, studentId, "post_test"),
    assignmentRepository.findByClassAndStudent(classId, studentId),
  ]);

  const self = members.find(
    (member) =>
      member.studentId._id.toString() === studentId &&
      member.status === "active",
  );
  if (!self) {
    return null;
  }

  const [entry] = buildProgressEntries(
    [self],
    messageStats,
    questionStats,
    profile ? [profile] : [],
    buildAssessmentsByStudent(
      preTest ? [preTest] : [],
      postTest ? [postTest] : [],
    ),
    buildAssignmentsByStudent(assignments),
  );
  return entry;
}

module.exports = getMyProgress;
