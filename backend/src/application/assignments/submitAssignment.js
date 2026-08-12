// Use-case: student submits (or re-submits, before grading) their work for one assignment
// (requires a completed pre-test).
const AppError = require("../../domain/errors/AppError");
const { assertPretestCompleted } = require("../classes/classAccess");
const {
  uploadSubmissionFile,
} = require("../../infrastructure/storage/fileStorage");

async function submitAssignment(
  { assignmentRepository, assessmentRepository },
  { assignmentId, studentId, text, file },
) {
  const assignment = await assignmentRepository.findById(assignmentId);
  if (!assignment) throw new AppError("Assignment not found.", 404);
  if (assignment.studentId.toString() !== studentId) {
    throw new AppError("You don't have access to this assignment.", 403);
  }
  await assertPretestCompleted(
    assessmentRepository,
    assignment.classId,
    studentId,
  );
  if (assignment.status === "graded") {
    throw new AppError(
      "This assignment has already been graded and can't be resubmitted.",
      409,
    );
  }
  if (!text && !file) {
    throw new AppError("Provide a text submission or a file.", 400);
  }

  if (file) {
    const { url } = await uploadSubmissionFile({
      assignmentId,
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });
    assignment.submissionFileUrl = url;
    assignment.submissionFileType = file.mimetype;
  }
  if (text) assignment.submissionText = text;
  assignment.submittedAt = new Date();
  assignment.status = "submitted";
  await assignmentRepository.save(assignment);

  return { submitted: true, submittedAt: assignment.submittedAt };
}

module.exports = submitAssignment;
