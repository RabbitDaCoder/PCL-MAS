const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("../classes/classAccess");

const TYPE_MAP = { "pre-test": "pre_test", "post-test": "post_test" };

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) return [];

  return questions.map((question) => {
    const options = Array.isArray(question.options)
      ? question.options
          .map((option) => String(option ?? "").trim())
          .filter(Boolean)
      : [];

    const prompt = String(question.prompt ?? "").trim();
    const correctAnswer = String(
      question.correctAnswer ?? options[0] ?? "",
    ).trim();

    return {
      topic: String(question.topic ?? "").trim(),
      prompt,
      options,
      correctAnswer,
    };
  });
}

async function reviewAssessment(
  { classRepository, assessmentRepository },
  { classId, lecturerId, type, decision, questions },
) {
  const dbType = TYPE_MAP[type];
  if (!dbType) throw new AppError("Invalid assessment type.", 400);
  if (decision !== "approve" && decision !== "reject") {
    throw new AppError('decision must be "approve" or "reject".', 400);
  }

  await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  const assessments = await assessmentRepository.findByClassAndType(
    classId,
    dbType,
  );
  if (assessments.length === 0) {
    throw new AppError("This assessment hasn't been generated yet.", 404);
  }

  const nextQuestions = normalizeQuestions(questions);
  const hasEdits = nextQuestions.length > 0;
  // Captured before mutation, so a lecturer re-approving an already-approved assessment (e.g.
  // after a later edit) doesn't re-trigger the release announcement.
  const wasAlreadyApproved = assessments[0].reviewStatus === "approved";

  for (const assessment of assessments) {
    if (decision === "approve") {
      if (hasEdits) {
        assessment.questions = nextQuestions;
      }
      assessment.reviewStatus = "approved";
      assessment.approvedBy = lecturerId;
      assessment.reviewedAt = new Date();
      assessment.status = assessment.status === "pending" ? "in_progress" : assessment.status;
    } else {
      assessment.reviewStatus = "rejected";
      assessment.approvedBy = null;
      assessment.reviewedAt = new Date();
    }

    await assessmentRepository.save(assessment);
  }

  return {
    reviewStatus: decision === "approve" ? "approved" : "rejected",
    approvedCount: assessments.length,
    justApproved: decision === "approve" && !wasAlreadyApproved,
  };
}

module.exports = reviewAssessment;
