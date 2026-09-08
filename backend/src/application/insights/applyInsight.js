// Use-case: lecturer applies a (possibly edited) improvement insight to the class's AI
// instructions. Calls Phase A's updateClassAiInstructions directly — the one write primitive for
// this field — rather than duplicating the write, and logs a before/after audit record.
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("../classes/classAccess");
const updateClassAiInstructions = require("../classes/updateClassAiInstructions");

async function applyInsight(
  { classRepository, approvalRepository, agentTaskRepository },
  { classId, insightId, lecturerId, finalInstructionText },
) {
  const classDoc = await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  const approval = await approvalRepository.findById(insightId);
  if (!approval || approval.classId.toString() !== classId) {
    throw new AppError("Insight not found.", 404);
  }
  if (typeof finalInstructionText !== "string" || !finalInstructionText.trim()) {
    throw new AppError("finalInstructionText is required.", 400);
  }

  const previousInstructions = classDoc.aiInstructions ?? "";

  const result = await updateClassAiInstructions(
    { classRepository },
    { classId, lecturerId, aiInstructions: finalInstructionText },
  );

  await agentTaskRepository.create({
    classId,
    agentType: "lecturer",
    taskType: "config-change",
    status: "completed",
    input: { previousInstructions, insightId },
    output: { newInstructions: result.aiInstructions },
    completedAt: new Date(),
  });

  const updatedApproval = await approvalRepository.updateStatus(insightId, {
    status: "approved",
    reviewedBy: lecturerId,
    reviewedAt: new Date(),
  });

  return {
    classId: result.classId,
    aiInstructions: result.aiInstructions,
    insightStatus: updatedApproval.status,
  };
}

module.exports = applyInsight;
