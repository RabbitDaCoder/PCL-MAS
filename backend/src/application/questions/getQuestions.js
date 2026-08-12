// Use-case: all questions across the lecturer's own classes, optionally filtered by status.
function toQuestionSummary(question) {
  const student = question.studentId;
  const classDoc = question.classId;
  return {
    id: question.id.toString(),
    classId: classDoc?.id?.toString() ?? question.classId?.toString(),
    className: classDoc?.name ?? null,
    studentName: student ? `${student.firstName} ${student.lastName}` : null,
    questionText: question.questionText,
    status: question.status,
    lecturerResponse: question.lecturerResponse ?? null,
    respondedAt: question.respondedAt,
    createdAt: question.createdAt,
  };
}

async function getQuestions(
  { classRepository, questionRepository },
  { lecturerId, status },
) {
  const classes = await classRepository.findByLecturer(lecturerId);
  const classIds = classes.map((classDoc) => classDoc.id);
  if (classIds.length === 0) return [];

  const questions = await questionRepository.findByClassIds(classIds, status);
  return questions.map(toQuestionSummary);
}

module.exports = getQuestions;
