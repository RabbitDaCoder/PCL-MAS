// Use-case: lecturer's deep-dive view of ONE student in a class — full analytics, personalization
// history, AI interaction patterns, and a before/after intervention comparison. Reuses the same
// building blocks as the class-wide Progress view (buildProgressEntries.js) rather than
// duplicating them.
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("../classes/classAccess");
const {
  buildAssessmentsByStudent,
  buildAssignmentsByStudent,
} = require("./buildProgressEntries");

// Real, derived from the assessment's own startedAt/completedAt — not new tracking.
function computeDurationMinutes(assessment) {
  if (!assessment?.startedAt || !assessment?.completedAt) return null;
  return Math.round((assessment.completedAt - assessment.startedAt) / 60000);
}

// Honest about "not available yet" rather than defaulting to 0 when there's no post-test.
function computeImprovement(preTest, postTest) {
  const preScore = preTest?.score ?? null;
  const postScore = postTest?.score ?? null;
  if (preScore === null || postScore === null) {
    return { preScore, postScore, delta: null, hasImproved: null };
  }
  return {
    preScore,
    postScore,
    delta: postScore - preScore,
    hasImproved: postScore > preScore,
  };
}

function summarizeInteractions(interactions) {
  const byAgent = {};
  for (const interaction of interactions) {
    byAgent[interaction.agentType] = (byAgent[interaction.agentType] ?? 0) + 1;
  }
  return {
    total: interactions.length,
    byAgent,
    recent: interactions.map((interaction) => ({
      agentType: interaction.agentType,
      message: interaction.message,
      response: interaction.response,
      createdAt: interaction.createdAt,
    })),
  };
}

async function getStudentDetail(
  {
    classRepository,
    userRepository,
    messageRepository,
    questionRepository,
    learningProfileRepository,
    assessmentRepository,
    assignmentRepository,
    aiInteractionRepository,
  },
  { classId, lecturerId, studentId },
) {
  await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  const members = await classRepository.findMembers(classId);
  const member = members.find(
    (m) =>
      (m.studentId?._id ?? m.studentId).toString() === studentId &&
      m.status === "active",
  );
  if (!member) {
    throw new AppError("Student not found in this class.", 404);
  }

  const [
    studentUser,
    messageStats,
    questionStats,
    profile,
    preTest,
    postTest,
    assignments,
    interactions,
  ] = await Promise.all([
    userRepository.findById(studentId),
    messageRepository.getStudentEngagementByClass(classId),
    questionRepository.getStudentEngagementByClass(classId),
    learningProfileRepository.findOne(studentId, classId),
    assessmentRepository.findOne(classId, studentId, "pre_test"),
    assessmentRepository.findOne(classId, studentId, "post_test"),
    assignmentRepository.findByClassAndStudent(classId, studentId),
    aiInteractionRepository.findByStudentAndClass(studentId, classId, 20),
  ]);

  const assessments = buildAssessmentsByStudent(
    preTest ? [preTest] : [],
    postTest ? [postTest] : [],
  ).get(studentId) ?? { preTest: null, postTest: null };

  const messages = messageStats.find((row) => row._id.toString() === studentId);
  const questions = questionStats.find((row) => row._id.toString() === studentId);

  return {
    studentId,
    firstName: member.studentId.firstName,
    lastName: member.studentId.lastName,
    email: member.studentId.email,
    joinedAt: member.createdAt,
    lastLoginAt: studentUser?.lastLoginAt ?? null,
    loginCount: studentUser?.loginCount ?? 0,
    messageCount: messages?.messageCount ?? 0,
    lastMessageAt: messages?.lastMessageAt ?? null,
    questionCount: questions?.questionCount ?? 0,
    lastQuestionAt: questions?.lastQuestionAt ?? null,
    assessments: {
      preTest: assessments.preTest
        ? { ...assessments.preTest, durationMinutes: computeDurationMinutes(preTest) }
        : null,
      postTest: assessments.postTest
        ? { ...assessments.postTest, durationMinutes: computeDurationMinutes(postTest) }
        : null,
    },
    assignments: buildAssignmentsByStudent(assignments).get(studentId) ?? {
      total: 0,
      submitted: 0,
      graded: 0,
      averageScore: null,
    },
    learningProfile: profile
      ? {
          strengths: profile.strengths,
          weaknesses: profile.weaknesses,
          knowledgeGaps: profile.knowledgeGaps,
          learningPace: profile.learningPace,
          recommendedTopics: profile.recommendedTopics,
          learningPathSteps: profile.learningPathSteps,
          progressSummary: profile.progressSummary,
          lastAssessmentScore: profile.lastAssessmentScore,
          reviewStatus: profile.reviewStatus ?? null,
          reviewFeedback: profile.reviewFeedback ?? null,
          history: profile.history ?? [],
        }
      : null,
    aiInteractions: summarizeInteractions(interactions),
    improvement: computeImprovement(assessments.preTest, assessments.postTest),
  };
}

module.exports = getStudentDetail;
