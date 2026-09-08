// Mongoose-backed implementation of the domain DirectMessageRepository contract.
const DirectMessageRepository = require("../../domain/repositories/DirectMessageRepository");
const DirectMessageModel = require("../database/models/DirectMessage");

class MongoDirectMessageRepository extends DirectMessageRepository {
  async create(data) {
    return DirectMessageModel.create(data);
  }

  async findByStudentAndClass(studentId, classId) {
    return DirectMessageModel.find({ studentId, classId }).sort({
      createdAt: 1,
    });
  }

  async existsForStudentAndClass(studentId, classId) {
    const count = await DirectMessageModel.countDocuments({
      studentId,
      classId,
    });
    return count > 0;
  }

  // Scoped by studentId + senderType "ai" in the query itself, so a student can't stamp
  // feedback onto another student's thread, or onto their own human-authored message.
  async setFeedback(messageId, studentId, feedback) {
    return DirectMessageModel.findOneAndUpdate(
      { _id: messageId, studentId, senderType: "ai" },
      { $set: { feedback } },
      { new: true },
    );
  }

  // AI-authored messages that have been rated, for the insights evaluation pipeline.
  async findFeedbackByClass(classId) {
    return DirectMessageModel.find({
      classId,
      senderType: "ai",
      feedback: { $exists: true },
    }).select("aiAgent content feedback");
  }
}

module.exports = MongoDirectMessageRepository;
