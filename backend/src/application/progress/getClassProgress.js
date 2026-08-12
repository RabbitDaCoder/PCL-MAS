// Use-case: lecturer's per-student Progress view for one class — combines simple engagement
// stats (messages/questions) with pre/post-test scores, assignment completion, and the
// AI-populated LearningProfile when available.
const { assertLecturerOwnsClass } = require("../classes/classAccess");
const {
  buildProgressEntries,
  buildAssessmentsByStudent,
  buildAssignmentsByStudent,
} = require("./buildProgressEntries");

async function getClassProgress(deps, { classId, lecturerId }) {
  const {
    classRepository,
    messageRepository,
    questionRepository,
    learningProfileRepository,
    assessmentRepository,
    assignmentRepository,
  } = deps;

  await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  const [
    members,
    messageStats,
    questionStats,
    profiles,
    preTests,
    postTests,
    assignments,
  ] = await Promise.all([
    classRepository.findMembers(classId),
    messageRepository.getStudentEngagementByClass(classId),
    questionRepository.getStudentEngagementByClass(classId),
    learningProfileRepository.findByClass(classId),
    assessmentRepository.findByClassAndType(classId, "pre_test"),
    assessmentRepository.findByClassAndType(classId, "post_test"),
    assignmentRepository.findByClass(classId),
  ]);

  const activeMembers = members.filter((member) => member.status === "active");

  return buildProgressEntries(
    activeMembers,
    messageStats,
    questionStats,
    profiles,
    buildAssessmentsByStudent(preTests, postTests),
    buildAssignmentsByStudent(assignments),
  );
}

module.exports = getClassProgress;
