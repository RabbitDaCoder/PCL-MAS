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

  // Same as upsert, but first snapshots the profile's current state into `history` if it already
  // has a learning path — so a regeneration (student-initiated or lecturer-rejected) archives the
  // previous version instead of silently destroying it.
  async upsertWithHistory(studentId, classId, fields) {
    const existing = await LearningProfileModel.findOne({ studentId, classId });
    const update = { $set: fields };
    if (existing && existing.learningPathSteps?.length) {
      update.$push = {
        history: {
          steps: existing.learningPathSteps,
          summary: existing.progressSummary,
          weaknesses: existing.weaknesses,
          knowledgeGaps: existing.knowledgeGaps,
          reviewStatus: existing.reviewStatus,
          reviewedBy: existing.reviewedBy,
          replacedAt: new Date(),
        },
      };
    }
    return LearningProfileModel.findOneAndUpdate(
      { studentId, classId },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

module.exports = MongoLearningProfileRepository;
