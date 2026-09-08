// Mongoose-backed implementation of the domain ApprovalRepository contract.
const ApprovalRepository = require("../../domain/repositories/ApprovalRepository");
const ApprovalModel = require("../database/models/Approval");

class MongoApprovalRepository extends ApprovalRepository {
  async create(data) {
    return ApprovalModel.create(data);
  }

  async findById(approvalId) {
    return ApprovalModel.findById(approvalId);
  }

  async findByClass(classId, status) {
    return ApprovalModel.find({
      classId,
      ...(status ? { status } : {}),
    }).sort({ createdAt: -1 });
  }

  async findByStudent(studentId, status) {
    return ApprovalModel.find({
      studentId,
      ...(status ? { status } : {}),
    }).sort({ createdAt: -1 });
  }

  async updateStatus(approvalId, fields) {
    return ApprovalModel.findByIdAndUpdate(
      approvalId,
      { $set: fields },
      { new: true },
    );
  }
}

module.exports = MongoApprovalRepository;
