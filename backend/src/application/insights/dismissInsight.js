// Use-case: lecturer dismisses an improvement insight without applying it.
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("../classes/classAccess");

async function dismissInsight(
  { classRepository, approvalRepository },
  { classId, insightId, lecturerId, reason },
) {
  await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  const approval = await approvalRepository.findById(insightId);
  if (!approval || approval.classId.toString() !== classId) {
    throw new AppError("Insight not found.", 404);
  }

  const updated = await approvalRepository.updateStatus(insightId, {
    status: "rejected",
    reviewedBy: lecturerId,
    reviewedAt: new Date(),
    ...(typeof reason === "string" && reason.trim() ? { lecturerFeedback: reason.trim() } : {}),
  });

  return { id: updated.id.toString(), status: updated.status };
}

module.exports = dismissInsight;
