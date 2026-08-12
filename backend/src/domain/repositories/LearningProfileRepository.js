// Repository contract for AI-populated per-student learning profiles (per class).
class LearningProfileRepository {
  async findByClass(_classId) {
    throw new Error("Not implemented");
  }

  async findOne(_studentId, _classId) {
    throw new Error("Not implemented");
  }

  async upsert(_studentId, _classId, _fields) {
    throw new Error("Not implemented");
  }
}

module.exports = LearningProfileRepository;
