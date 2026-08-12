// Mongoose-backed implementation of the domain AssessmentRepository contract.
const AssessmentRepository = require("../../domain/repositories/AssessmentRepository");
const AssessmentModel = require("../database/models/Assessment");

class MongoAssessmentRepository extends AssessmentRepository {
  async createMany(assessments) {
    return AssessmentModel.insertMany(assessments);
  }

  async existsForClassAndType(classId, type) {
    const found = await AssessmentModel.findOne({ classId, type }).select(
      "_id",
    );
    return Boolean(found);
  }

  async findByClassAndType(classId, type) {
    return AssessmentModel.find({ classId, type }).populate({
      path: "studentId",
      select: "firstName lastName email",
    });
  }

  async findOne(classId, studentId, type) {
    return AssessmentModel.findOne({ classId, studentId, type });
  }

  async findById(assessmentId) {
    return AssessmentModel.findById(assessmentId);
  }

  async save(assessment) {
    return assessment.save();
  }
}

module.exports = MongoAssessmentRepository;
