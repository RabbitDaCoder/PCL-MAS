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
