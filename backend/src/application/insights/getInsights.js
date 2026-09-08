// Use-case: lecturer lists improvement insights for a class (defaults to pending ones).
const { assertLecturerOwnsClass } = require("../classes/classAccess");

function toInsightSummary(approval) {
  return {
    id: approval.id.toString(),
    classId: approval.classId.toString(),
    status: approval.status,
    title: approval.content?.title,
    evidence: approval.content?.evidence,
    suggestedInstructionText: approval.content?.suggestedInstructionText,
    severity: approval.content?.severity,
    lecturerFeedback: approval.lecturerFeedback ?? null,
    createdAt: approval.createdAt,
    reviewedAt: approval.reviewedAt ?? null,
  };
}

async function getInsights(
  { classRepository, approvalRepository },
  { classId, lecturerId, status = "pending" },
) {
  await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  const approvals = await approvalRepository.findByClass(classId, status || undefined);
  const insights = approvals
    .filter((approval) => approval.requestType === "improvement-insight")
    .map(toInsightSummary);

  return { insights };
}

module.exports = getInsights;
module.exports.toInsightSummary = toInsightSummary;
