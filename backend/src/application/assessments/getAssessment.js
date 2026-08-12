// Use-case: fetch an assessment — student sees their own attempt (auto-starts it on first
// fetch, questions sanitized of correct answers); lecturer sees generation/completion stats.
// A student must have completed their pre-test before accessing the post-test.
const AppError = require("../../domain/errors/AppError");
const generateAssessment = require("./generateAssessment");
const {
  assertClassAccess,
  assertPretestCompleted,
} = require("../classes/classAccess");

const TYPE_MAP = { "pre-test": "pre_test", "post-test": "post_test" };

function sanitizeQuestion(question) {
  return {
    topic: question.topic,
    prompt: question.prompt,
    options: question.options,
  };
}

async function getAssessment(
  { classRepository, materialRepository, assessmentRepository },
  { classId, userId, role, type },
) {
  const dbType = TYPE_MAP[type];
  if (!dbType) throw new AppError("Invalid assessment type.", 400);

  await assertClassAccess(classRepository, classId, userId, role);
  if (role === "student" && dbType === "post_test") {
    await assertPretestCompleted(assessmentRepository, classId, userId);
  }

  if (role === "student") {
    let assessment = await assessmentRepository.findOne(
      classId,
      userId,
      dbType,
    );

    if (!assessment && dbType === "pre_test") {
      const classDoc = await classRepository.findById(classId);
      if (!classDoc) {
        throw new AppError("Class not found.", 404);
      }

      await generateAssessment(
        { classRepository, materialRepository, assessmentRepository },
        {
          classId,
          lecturerId: classDoc.lecturerId.toString(),
          type,
        },
      );
      assessment = await assessmentRepository.findOne(classId, userId, dbType);
    }

    if (!assessment) {
      return {
        generated: false,
        autoGenerating: dbType === "pre_test",
        message:
          "Your lecturer AI is generating this pre-test and will send it to your lecturer for approval automatically. Check back soon.",
      };
    }

    if (assessment.status === "pending") {
      assessment.status = "in_progress";
      assessment.startedAt = new Date();
      await assessmentRepository.save(assessment);
    }

    return {
      generated: true,
      id: assessment.id.toString(),
      status: assessment.status,
      score: assessment.score ?? null,
      questions: assessment.questions.map(sanitizeQuestion),
    };
  }

  // lecturer view: generation/completion stats + a preview with correct answers
  const assessments = await assessmentRepository.findByClassAndType(
    classId,
    dbType,
  );
  if (assessments.length === 0) return { generated: false };

  const completedCount = assessments.filter(
    (a) => a.status === "completed",
  ).length;
  const completedScores = assessments
    .filter((a) => a.status === "completed" && typeof a.score === "number")
    .map((a) => a.score);
  const averageScore = completedScores.length
    ? Math.round(
        completedScores.reduce((sum, score) => sum + score, 0) /
          completedScores.length,
      )
    : null;

  return {
    generated: true,
    totalStudents: assessments.length,
    completedCount,
    averageScore,
    questions: assessments[0].questions,
  };
}

module.exports = getAssessment;
