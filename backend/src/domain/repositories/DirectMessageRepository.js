// Repository contract for the 1:1 Administrative AI direct-message thread (per student, per class).
class DirectMessageRepository {
  async create(_data) {
    throw new Error("Not implemented");
  }

  async findByStudentAndClass(_studentId, _classId) {
    throw new Error("Not implemented");
  }

  async existsForStudentAndClass(_studentId, _classId) {
    throw new Error("Not implemented");
  }

  async setFeedback(_messageId, _studentId, _feedback) {
    throw new Error("Not implemented");
  }

  async findFeedbackByClass(_classId) {
    throw new Error("Not implemented");
  }
}

module.exports = DirectMessageRepository;
