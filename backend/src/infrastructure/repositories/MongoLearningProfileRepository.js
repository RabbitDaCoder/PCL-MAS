// Mongoose-backed implementation of the domain LearningProfileRepository contract.
const LearningProfileRepository = require("../../domain/repositories/LearningProfileRepository");
const LearningProfileModel = require("../database/models/LearningProfile");

class MongoLearningProfileRepository extends LearningProfileRepository {
  async findByClass(classId) {
    return LearningProfileModel.find({ classId });
  }

  async findOne(studentId, classId) {
    return LearningProfileModel.findOne({ studentId, classId });
  }

  async upsert(studentId, classId, fields) {
    return LearningProfileModel.findOneAndUpdate(
      { studentId, classId },
      { $set: fields },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

module.exports = MongoLearningProfileRepository;
