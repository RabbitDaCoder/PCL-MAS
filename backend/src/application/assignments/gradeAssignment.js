// Use-case: lecturer grades a student's submitted assignment.
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("../classes/classAccess");

async function gradeAssignment(
  { classRepository, assignmentRepository },
  { assignmentId, lecturerId, score, feedback },
) {
  const assignment = await assignmentRepository.findById(assignmentId);
  if (!assignment) throw new AppError("Assignment not found.", 404);

  await assertLecturerOwnsClass(
    classRepository,
    assignment.classId,
    lecturerId,
  );

  if (assignment.status !== "submitted") {
    throw new AppError("This assignment hasn't been submitted yet.", 400);
  }
  if (typeof score !== "number" || score < 0 || score > 100) {
    throw new AppError("Score must be a number between 0 and 100.", 400);
  }

  assignment.score = score;
  assignment.feedback = feedback ?? "";
  assignment.status = "graded";
  await assignmentRepository.save(assignment);

  return { graded: true, score: assignment.score };
}

module.exports = gradeAssignment;
