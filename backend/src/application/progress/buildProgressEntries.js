// Shared shaping logic for a class's Progress entries — one row per active student, combining
// message/question engagement aggregates with assessments/assignments/LearningProfile data.
function idOf(ref) {
  return (ref?._id ?? ref).toString();
}

function assessmentSummary(doc) {
  if (!doc) return null;
  return { status: doc.status, score: doc.score ?? null };
}

// docs may be a flat array (lecturer: all students) or contain at most one doc per student
// (student: their own attempt) — either way, indexed by studentId.
function buildAssessmentsByStudent(preTestDocs, postTestDocs) {
  const map = new Map();
  for (const doc of preTestDocs) {
    const id = idOf(doc.studentId);
    map.set(id, { ...(map.get(id) ?? {}), preTest: assessmentSummary(doc) });
  }
  for (const doc of postTestDocs) {
    const id = idOf(doc.studentId);
    map.set(id, { ...(map.get(id) ?? {}), postTest: assessmentSummary(doc) });
  }
  return map;
}

function buildAssignmentsByStudent(assignmentDocs) {
  const raw = new Map();
  for (const doc of assignmentDocs) {
    const id = idOf(doc.studentId);
    const entry = raw.get(id) ?? {
      total: 0,
      submitted: 0,
      graded: 0,
      scores: [],
    };
    entry.total += 1;
    if (doc.status === "submitted" || doc.status === "graded")
      entry.submitted += 1;
    if (doc.status === "graded") {
      entry.graded += 1;
      if (typeof doc.score === "number") entry.scores.push(doc.score);
    }
    raw.set(id, entry);
  }
  const result = new Map();
  for (const [id, entry] of raw) {
    const averageScore = entry.scores.length
      ? Math.round(
          entry.scores.reduce((sum, score) => sum + score, 0) /
            entry.scores.length,
        )
      : null;
    result.set(id, {
      total: entry.total,
      submitted: entry.submitted,
      graded: entry.graded,
      averageScore,
    });
  }
  return result;
}

function buildProgressEntries(
  activeMembers,
  messageStats,
  questionStats,
  profiles,
  assessmentsByStudent = new Map(),
  assignmentsByStudent = new Map(),
) {
  const messageById = new Map(
    messageStats.map((row) => [row._id.toString(), row]),
  );
  const questionById = new Map(
    questionStats.map((row) => [row._id.toString(), row]),
  );
  const profileById = new Map(
    profiles.map((profile) => [profile.studentId.toString(), profile]),
  );

  return activeMembers.map((member) => {
    const studentId = member.studentId._id.toString();
    const messages = messageById.get(studentId);
    const questions = questionById.get(studentId);
    const profile = profileById.get(studentId);

    const lastMessageAt = messages?.lastMessageAt ?? null;
    const lastQuestionAt = questions?.lastQuestionAt ?? null;
    const joinedAt = member.createdAt;
    const lastActiveAt = [lastMessageAt, lastQuestionAt, joinedAt]
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];

    return {
      studentId,
      firstName: member.studentId.firstName,
      lastName: member.studentId.lastName,
      email: member.studentId.email,
      joinedAt,
      messageCount: messages?.messageCount ?? 0,
      lastMessageAt,
      questionCount: questions?.questionCount ?? 0,
      lastQuestionAt,
      lastActiveAt,
      assessments: assessmentsByStudent.get(studentId) ?? {
        preTest: null,
        postTest: null,
      },
      assignments: assignmentsByStudent.get(studentId) ?? {
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
            preferredLearningMethods: profile.preferredLearningMethods,
            recommendedTopics: profile.recommendedTopics,
            learningPathSteps: profile.learningPathSteps,
            progressSummary: profile.progressSummary,
            lastAssessmentScore: profile.lastAssessmentScore,
            reviewStatus: profile.reviewStatus ?? null,
          }
        : null,
    };
  });
}

module.exports = {
  buildProgressEntries,
  buildAssessmentsByStudent,
  buildAssignmentsByStudent,
};
