// Mongoose-backed implementation of the domain MessageRepository contract.
const { Types } = require("mongoose");
const MessageRepository = require("../../domain/repositories/MessageRepository");
const MessageModel = require("../database/models/Message");

class MongoMessageRepository extends MessageRepository {
  async create(messageData) {
    const message = await MessageModel.create(messageData);
    return message.populate({ path: "senderId", select: "firstName lastName" });
  }

  async clearByClass(classId) {
    await MessageModel.deleteMany({ classId });
  }

  async findByClass(classId, page, limit) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      MessageModel.find({ classId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "senderId", select: "firstName lastName" }),
      MessageModel.countDocuments({ classId }),
    ]);
    return { messages: messages.reverse(), total };
  }

  // Scoped by classId + senderType "ai" in the query itself, so a student can't stamp feedback
  // onto another class's message, or onto a human-authored message, by guessing an id.
  async setFeedback(messageId, classId, feedback) {
    return MessageModel.findOneAndUpdate(
      { _id: messageId, classId, senderType: "ai" },
      { $set: { feedback } },
      { new: true },
    );
  }

  // AI-authored messages that have been rated, for the insights evaluation pipeline — a small
  // class dataset, so a plain find + JS reduce is used rather than an aggregation pipeline.
  async findFeedbackByClass(classId) {
    return MessageModel.find({ classId, senderType: "ai", feedback: { $exists: true } }).select(
      "aiAgent content feedback",
    );
  }

  // Per-student message counts + last-sent timestamp, for the class Progress view.
  async getStudentEngagementByClass(classId) {
    return MessageModel.aggregate([
      {
        $match: { classId: new Types.ObjectId(classId), senderType: "student" },
      },
      {
        $group: {
          _id: "$senderId",
          messageCount: { $sum: 1 },
          lastMessageAt: { $max: "$createdAt" },
        },
      },
    ]);
  }
}

module.exports = MongoMessageRepository;
