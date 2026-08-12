// Mongoose-backed implementation of the domain QuestionRepository contract.
const { Types } = require("mongoose");
const QuestionRepository = require("../../domain/repositories/QuestionRepository");
const QuestionModel = require("../database/models/Question");
const EnrollmentModel = require("../database/models/Enrollment");

class MongoQuestionRepository extends QuestionRepository {
  async create(questionData) {
    return QuestionModel.create(questionData);
  }

  async findByClassIds(classIds, status) {
    const filter = { classId: { $in: classIds } };
    if (status) filter.status = status;
    return QuestionModel.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: "studentId", select: "firstName lastName" })
      .populate({ path: "classId", select: "name courseCode" });
  }

  async findById(questionId) {
    return QuestionModel.findById(questionId).populate({
      path: "classId",
      select: "lecturerId name courseCode",
    });
  }

  async update(questionId, updates) {
    return QuestionModel.findByIdAndUpdate(questionId, updates, { new: true });
  }

  async findOneActiveEnrolledStudent(classId) {
    return EnrollmentModel.findOne({ classId, status: "active" }).select(
      "studentId",
    );
  }

  async findByStudent(studentId) {
    return QuestionModel.find({ studentId })
      .sort({ createdAt: -1 })
      .populate({ path: "classId", select: "name courseCode" });
  }

  // Per-student question counts + last-asked timestamp, for the class Progress view.
  async getStudentEngagementByClass(classId) {
    return QuestionModel.aggregate([
      { $match: { classId: new Types.ObjectId(classId) } },
      {
        $group: {
          _id: "$studentId",
          questionCount: { $sum: 1 },
          lastQuestionAt: { $max: "$createdAt" },
        },
      },
    ]);
  }
}

module.exports = MongoQuestionRepository;
