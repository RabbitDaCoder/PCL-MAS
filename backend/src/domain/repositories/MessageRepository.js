// Repository contract for class chat messages.
class MessageRepository {
  async create(_messageData) {
    throw new Error("Not implemented");
  }

  async clearByClass(_classId) {
    throw new Error("Not implemented");
  }

  async findByClass(_classId, _page, _limit) {
    throw new Error("Not implemented");
  }

  async setFeedback(_messageId, _classId, _feedback) {
    throw new Error("Not implemented");
  }

  async findFeedbackByClass(_classId) {
    throw new Error("Not implemented");
  }
}

module.exports = MessageRepository;
