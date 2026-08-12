// Use-case: student generates their personalized learning path from their completed pre-test —
// computes per-topic scores server-side, then asks the Instructor Agent to turn that into a plan.
const AppError = require("../../domain/errors/AppError");
const { assertClassAccess } = require("../classes/classAccess");
const env = require("../../config/env");

const GENERATE_TIMEOUT_MS = 60000;
const WEAK_THRESHOLD = 60;
const STRONG_THRESHOLD = 80;

function computeTopicScores(assessment) {
  const totals = new Map();
  assessment.questions.forEach((question, index) => {
    const topic = question.topic || "General";
    const isCorrect = assessment.answers?.[index] === question.correctAnswer;
    const entry = totals.get(topic) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (isCorrect) entry.correct += 1;
    totals.set(topic, entry);
  });

  const topicScores = {};
  for (const [topic, { correct, total }] of totals) {
    topicScores[topic] = Math.round((correct / total) * 100);
  }
  return topicScores;
}

// Shared by the student's own generate button AND a lecturer rejecting a path (which
// regenerates a fresh one) — everything after access/pretest checks have already passed.
async function runLearningPathGeneration(
  { classRepository, assessmentRepository, learningProfileRepository },
  { classId, studentId },
) {
  const classDoc = await classRepository.findById(classId);

  const assessment = await assessmentRepository.findOne(
    classId,
    studentId,
    "pre_test",
  );
  if (!assessment || assessment.status !== "completed") {
    throw new AppError("Complete the pre-test first.", 400);
  }

  const topicScores = computeTopicScores(assessment);
  const weakTopics = Object.entries(topicScores)
    .filter(([, score]) => score < WEAK_THRESHOLD)
    .map(([topic]) => topic);
  const strongTopics = Object.entries(topicScores)
    .filter(([, score]) => score >= STRONG_THRESHOLD)
    .map(([topic]) => topic);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GENERATE_TIMEOUT_MS);
  let result;
  try {
    const response = await fetch(
      `${env.aiServiceBaseUrl}/api/generate-learning-path`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          topics: classDoc.topics ?? [],
          learningObjectives: classDoc.learningObjectives ?? [],
          topicScores,
          weakTopics,
        }),
      },
    );
    if (!response.ok) {
      throw new AppError(
        "The AI service couldn't generate a learning path. Please try again shortly.",
        502,
      );
    }
    result = await response.json();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      "The AI service is unreachable. Please try again shortly.",
      502,
    );
  } finally {
    clearTimeout(timeout);
  }

  await learningProfileRepository.upsert(studentId, classId, {
    strengths: strongTopics,
    weaknesses: weakTopics,
    recommendedTopics: result.steps.map((step) => step.topic),
    learningPathSteps: result.steps,
    progressSummary: result.summary,
    lastAssessmentScore: assessment.score,
    reviewStatus: "pending",
    reviewedAt: null,
    reviewedBy: null,
  });

  return { summary: result.summary, steps: result.steps };
}

async function generateLearningPath(
  { classRepository, assessmentRepository, learningProfileRepository },
  { classId, studentId },
) {
  await assertClassAccess(classRepository, classId, studentId, "student");
  return runLearningPathGeneration(
    { classRepository, assessmentRepository, learningProfileRepository },
    { classId, studentId },
  );
}

module.exports = generateLearningPath;
module.exports.runLearningPathGeneration = runLearningPathGeneration;
