// Repository contract for per-student assessments (pre-test/post-test/assignment instances).
class AssessmentRepository {
  async createMany(_assessments) {
    throw new Error("Not implemented");
  }

  async existsForClassAndType(_classId, _type) {
    throw new Error("Not implemented");
  }

  async findByClassAndType(_classId, _type) {
    throw new Error("Not implemented");
  }

  async findOne(_classId, _studentId, _type) {
    throw new Error("Not implemented");
  }

  async findById(_assessmentId) {
    throw new Error("Not implemented");
  }

  async save(_assessment) {
    throw new Error("Not implemented");
  }
}

module.exports = AssessmentRepository;
