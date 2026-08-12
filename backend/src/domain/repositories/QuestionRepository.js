// Repository contract for lecturer question review.
class QuestionRepository {
  async create(_questionData) {
    throw new Error("Not implemented");
  }

  async findByClassIds(_classIds, _status) {
    throw new Error("Not implemented");
  }

  async findById(_questionId) {
    throw new Error("Not implemented");
  }

  async update(_questionId, _updates) {
    throw new Error("Not implemented");
  }

  async findOneActiveEnrolledStudent(_classId) {
    throw new Error("Not implemented");
  }

  async findByStudent(_studentId) {
    throw new Error("Not implemented");
  }
}

module.exports = QuestionRepository;
