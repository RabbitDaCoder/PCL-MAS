// Repository contract for logged student/agent AI exchanges.
class AIInteractionRepository {
  async create(_data) {
    throw new Error("Not implemented");
  }

  async findByClass(_classId) {
    throw new Error("Not implemented");
  }

  async findByStudentAndClass(_studentId, _classId, _limit) {
    throw new Error("Not implemented");
  }
}

module.exports = AIInteractionRepository;
