// Use-case: lecturer triggers improvement-insight generation for a class. Aggregates performance
// data, refuses to call the LLM at all if there's too little signal (prevents fabricated-looking
// insights from near-empty data), then persists each returned suggestion into the Approval queue
// for human review — nothing here applies anything itself.
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("../classes/classAccess");
const env = require("../../config/env");
const evaluatePerformance = require("./evaluatePerformance");
const { formatMetricsSummary } = require("./evaluatePerformance");

const REQUEST_TIMEOUT_MS = 60000;

async function generateInsights(
  { classRepository, assessmentRepository, learningProfileRepository, messageRepository, directMessageRepository, aiInteractionRepository, approvalRepository },
  { classId, lecturerId },
) {
  const classDoc = await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  const metrics = await evaluatePerformance(
    { assessmentRepository, learningProfileRepository, messageRepository, directMessageRepository, aiInteractionRepository },
    { classId },
  );

  if (!metrics.hasEnoughData) {
    return {
      generated: false,
      message:
        "Not enough activity yet to generate meaningful insights — this needs some student feedback or lecturer review notes first.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let insights;
  try {
    const response = await fetch(`${env.aiServiceBaseUrl}/api/generate-insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        topics: classDoc.topics ?? [],
        metricsSummary: formatMetricsSummary(metrics),
      }),
    });
    if (!response.ok) {
      throw new AppError(
        "The AI service couldn't generate insights. Please try again shortly.",
        502,
      );
    }
    const body = await response.json();
    insights = body.insights;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("The AI service is unreachable. Please try again shortly.", 502);
  } finally {
    clearTimeout(timeout);
  }

  if (!Array.isArray(insights) || insights.length === 0) {
    return {
      generated: false,
      message: "The AI didn't find any solid, evidence-backed suggestions this time.",
    };
  }

  const created = await Promise.all(
    insights.map((insight) =>
      approvalRepository.create({
        classId,
        requestType: "improvement-insight",
        content: {
          title: insight.title,
          evidence: insight.evidence,
          suggestedInstructionText: insight.suggestedInstructionText,
          severity: insight.severity,
        },
        status: "pending",
      }),
    ),
  );

  return { generated: true, count: created.length };
}

module.exports = generateInsights;
