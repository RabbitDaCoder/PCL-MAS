// Use-case: a student's own question history across all their classes, with the lecturer's
// response once available.
function toStudentQuestionSummary(question) {
  const classDoc = question.classId;
  return {
    id: question.id.toString(),
    classId: classDoc?.id?.toString() ?? question.classId?.toString(),
    className: classDoc?.name ?? null,
    courseCode: classDoc?.courseCode ?? null,
    questionText: question.questionText,
    status: question.status,
    lecturerResponse: question.lecturerResponse ?? null,
    respondedAt: question.respondedAt,
    createdAt: question.createdAt,
  };
}

async function getMyQuestions({ questionRepository }, { studentId }) {
  const questions = await questionRepository.findByStudent(studentId);
  return questions.map(toStudentQuestionSummary);
}

module.exports = getMyQuestions;
