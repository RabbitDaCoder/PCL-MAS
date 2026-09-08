// Use-case: aggregates a class's AI performance signals (review outcomes/feedback, message
// ratings, interaction volume) into the metrics the Improvement Analyst reasons over. Pure
// data-gathering — no auth here, callers (generateInsights.js) own the ownership check. Uses
// plain finds + JS reduction rather than aggregation pipelines, matching this codebase's
// existing style for per-class-sized datasets.
const MIN_SIGNAL_COUNT = 3;

// Pre-test/post-test review is a single decision applied to every student's copy at once (see
// reviewAssessment.js), so reviewStatus/reviewFeedback is identical across all of a type's docs —
// summarized once per type, not duplicated per student.
function summarizeAssessmentType(assessments) {
  if (assessments.length === 0) return null;
  const scores = assessments.map((a) => a.score).filter((s) => typeof s === "number");
  return {
    reviewStatus: assessments[0].reviewStatus,
    reviewFeedback: assessments[0].reviewFeedback || null,
    studentCount: assessments.length,
    completedCount: assessments.filter((a) => a.status === "completed").length,
    averageScore: scores.length
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : null,
  };
}

// Learning paths are reviewed independently per student, so per-student outcomes are aggregated.
function summarizeLearningPaths(profiles) {
  const reviewed = profiles.filter((p) => p.reviewStatus);
  return {
    total: profiles.length,
    approved: reviewed.filter((p) => p.reviewStatus === "approved").length,
    rejected: reviewed.filter((p) => p.reviewStatus === "rejected").length,
    feedbackTexts: reviewed
      .filter((p) => p.reviewFeedback)
      .slice(0, 5)
      .map((p) => p.reviewFeedback),
  };
}

function summarizeMessageFeedback(messages) {
  const byAgent = {};
  const downExamples = [];
  for (const message of messages) {
    const agent = message.aiAgent ?? "Unknown";
    byAgent[agent] = byAgent[agent] ?? { up: 0, down: 0 };
    if (message.feedback?.rating === "up") byAgent[agent].up += 1;
    if (message.feedback?.rating === "down") {
      byAgent[agent].down += 1;
      if (downExamples.length < 5) {
        downExamples.push({
          agent,
          content: message.content,
          note: message.feedback.note || null,
        });
      }
    }
  }
  return { byAgent, downExamples };
}

function summarizeInteractionVolume(interactions) {
  const byAgent = {};
  for (const interaction of interactions) {
    byAgent[interaction.agentType] = (byAgent[interaction.agentType] ?? 0) + 1;
  }
  return byAgent;
}

async function evaluatePerformance(
  {
    assessmentRepository,
    learningProfileRepository,
    messageRepository,
    directMessageRepository,
    aiInteractionRepository,
  },
  { classId },
) {
  const [preTests, postTests, learningProfiles, messageFeedback, dmFeedback, interactions] =
    await Promise.all([
      assessmentRepository.findByClassAndType(classId, "pre_test"),
      assessmentRepository.findByClassAndType(classId, "post_test"),
      learningProfileRepository.findByClass(classId),
      messageRepository.findFeedbackByClass(classId),
      directMessageRepository.findFeedbackByClass(classId),
      aiInteractionRepository.findByClass(classId),
    ]);

  const preTest = summarizeAssessmentType(preTests);
  const postTest = summarizeAssessmentType(postTests);
  const learningPaths = summarizeLearningPaths(learningProfiles);
  const feedback = summarizeMessageFeedback([...messageFeedback, ...dmFeedback]);
  const interactionVolume = summarizeInteractionVolume(interactions);

  const feedbackRatingCount = Object.values(feedback.byAgent).reduce(
    (sum, a) => sum + a.up + a.down,
    0,
  );
  const reviewFeedbackCount =
    (preTest?.reviewFeedback ? 1 : 0) +
    (postTest?.reviewFeedback ? 1 : 0) +
    learningPaths.feedbackTexts.length;
  const signalCount = feedbackRatingCount + reviewFeedbackCount;

  return {
    hasEnoughData: signalCount >= MIN_SIGNAL_COUNT,
    signalCount,
    preTest,
    postTest,
    learningPaths,
    feedback,
    interactionVolume,
  };
}

function formatMetricsSummary(metrics) {
  const lines = [];
  if (metrics.preTest) {
    lines.push(
      `Pre-test: ${metrics.preTest.reviewStatus}, ${metrics.preTest.completedCount}/${metrics.preTest.studentCount} completed, avg score ${metrics.preTest.averageScore ?? "n/a"}.` +
        (metrics.preTest.reviewFeedback
          ? ` Lecturer feedback: "${metrics.preTest.reviewFeedback}"`
          : ""),
    );
  }
  if (metrics.postTest) {
    lines.push(
      `Post-test: ${metrics.postTest.reviewStatus}, ${metrics.postTest.completedCount}/${metrics.postTest.studentCount} completed, avg score ${metrics.postTest.averageScore ?? "n/a"}.` +
        (metrics.postTest.reviewFeedback
          ? ` Lecturer feedback: "${metrics.postTest.reviewFeedback}"`
          : ""),
    );
  }
  if (metrics.learningPaths.total > 0) {
    lines.push(
      `Learning paths: ${metrics.learningPaths.approved} approved, ${metrics.learningPaths.rejected} rejected out of ${metrics.learningPaths.total}.`,
    );
  }
  if (metrics.learningPaths.feedbackTexts.length) {
    lines.push(
      `Lecturer feedback on learning paths: ${metrics.learningPaths.feedbackTexts.map((t) => `"${t}"`).join("; ")}`,
    );
  }
  for (const [agent, counts] of Object.entries(metrics.feedback.byAgent)) {
    lines.push(`${agent} message ratings: ${counts.up} up, ${counts.down} down.`);
  }
  if (metrics.feedback.downExamples.length) {
    lines.push(
      "Examples of poorly-rated replies: " +
        metrics.feedback.downExamples
          .map(
            (e) =>
              `[${e.agent}] "${e.content}"${e.note ? ` (student note: "${e.note}")` : ""}`,
          )
          .join("; "),
    );
  }
  for (const [agent, count] of Object.entries(metrics.interactionVolume)) {
    lines.push(`${agent} agent handled ${count} interactions.`);
  }
  return lines.join("\n") || "No data available.";
}

module.exports = evaluatePerformance;
module.exports.formatMetricsSummary = formatMetricsSummary;
