// Mongoose-backed implementation of the domain AssignmentRepository contract.
const AssignmentRepository = require("../../domain/repositories/AssignmentRepository");
const AssignmentModel = require("../database/models/Assignment");

class MongoAssignmentRepository extends AssignmentRepository {
  async createMany(assignments) {
    return AssignmentModel.insertMany(assignments);
  }

  async findByClass(classId) {
    return AssignmentModel.find({ classId })
      .sort({ createdAt: -1 })
      .populate({ path: "studentId", select: "firstName lastName email" });
  }

  async findByClassAndStudent(classId, studentId) {
    return AssignmentModel.find({ classId, studentId }).sort({
      createdAt: -1,
    });
  }

  async findById(assignmentId) {
    return AssignmentModel.findById(assignmentId);
  }

  async save(assignment) {
    return assignment.save();
  }
}

module.exports = MongoAssignmentRepository;
