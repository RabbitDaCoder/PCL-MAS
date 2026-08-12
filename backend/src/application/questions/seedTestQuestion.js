// DEV-ONLY helper use-case: seeds one test question so the Question Review page can be
// exercised before the real student-facing "ask a question" UI exists.
// TODO: remove once the student-facing question flow ships.
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("../classes/classAccess");

async function seedTestQuestion(
  { classRepository, questionRepository },
  { classId, lecturerId },
) {
  await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  const enrollment =
    await questionRepository.findOneActiveEnrolledStudent(classId);
  if (!enrollment) {
    throw new AppError(
      "This class has no active students to seed a test question for.",
      400,
    );
  }

  const question = await questionRepository.create({
    classId,
    studentId: enrollment.studentId,
    questionText: "[Dev seed] This is a test question for the review queue.",
    status: "pending",
  });

  return { id: question.id.toString() };
}

module.exports = seedTestQuestion;
