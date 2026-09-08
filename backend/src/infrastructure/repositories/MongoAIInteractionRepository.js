// Mongoose-backed implementation of the domain AIInteractionRepository contract.
const AIInteractionRepository = require("../../domain/repositories/AIInteractionRepository");
const AIInteractionModel = require("../database/models/AIInteraction");

class MongoAIInteractionRepository extends AIInteractionRepository {
  async create(data) {
    return AIInteractionModel.create(data);
  }

  // For the insights evaluation pipeline — volume per agent, computed in JS from a small
  // per-class dataset rather than an aggregation pipeline.
  async findByClass(classId) {
    return AIInteractionModel.find({ classId }).select("agentType createdAt");
  }

  // For the per-student detail view — one student's full interaction history within a class,
  // most recent first, capped so the profile page stays fast.
  async findByStudentAndClass(studentId, classId, limit = 20) {
    return AIInteractionModel.find({ studentId, classId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = MongoAIInteractionRepository;
