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
}

module.exports = MongoDirectMessageRepository;
