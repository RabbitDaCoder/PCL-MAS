// Mongoose-backed implementation of the domain ClassRepository contract.
const ClassRepository = require("../../domain/repositories/ClassRepository");
const ClassModel = require("../database/models/Class");
const EnrollmentModel = require("../database/models/Enrollment");
const { generateClassCode } = require("../../utils/classCode");

class MongoClassRepository extends ClassRepository {
  async findByLecturer(lecturerId) {
    return ClassModel.find({ lecturerId }).sort({ createdAt: -1 });
  }

  async findEnrollmentsByStudent(studentId) {
    return EnrollmentModel.find({
      studentId,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "classId",
        select: "name courseCode status lecturerId",
        populate: { path: "lecturerId", select: "firstName lastName" },
      });
  }

  async countAll() {
    return ClassModel.countDocuments();
  }

  async findAll() {
    return ClassModel.find()
      .sort({ createdAt: -1 })
      .populate({ path: "lecturerId", select: "firstName lastName" });
  }

  // If classData.classCode is already reserved (e.g. previewed in the create-class wizard), try
  // it first; otherwise — or if it's since been taken — fall back to generating a fresh one.
  async create(classData) {
    const { classCode: preferredCode, ...rest } = classData;
    let nextCode = preferredCode || generateClassCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await ClassModel.create({ ...rest, classCode: nextCode });
      } catch (err) {
        if (err.code === 11000 && attempt < 4) {
          nextCode = generateClassCode();
          continue;
        }
        throw err;
      }
    }
    throw new Error("Could not generate a unique class code.");
  }

  // Lazily backfills classCode for classes created before this field existed.
  async findById(classId) {
    const classDoc = await ClassModel.findById(classId);
    if (classDoc && !classDoc.classCode) {
      await this.ensureClassCode(classDoc);
    }
    return classDoc;
  }

  async ensureClassCode(classDoc) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        classDoc.classCode = generateClassCode();
        await classDoc.save();
        return classDoc;
      } catch (err) {
        if (err.code === 11000 && attempt < 4) continue;
        throw err;
      }
    }
    throw new Error("Could not generate a unique class code.");
  }

  async findByClassCode(classCode) {
    return ClassModel.findOne({ classCode: classCode.toUpperCase().trim() });
  }

  async findMembers(classId) {
    return EnrollmentModel.find({
      classId,
      status: { $in: ["pending", "invited", "active"] },
    })
      .sort({ createdAt: -1 })
      .populate({ path: "studentId", select: "firstName lastName email" });
  }

  async findMembershipByEmail(classId, email) {
    return EnrollmentModel.findOne({
      classId,
      inviteEmail: email.toLowerCase(),
      status: { $in: ["pending", "invited", "active"] },
    });
  }

  async findMembershipByStudentId(classId, studentId) {
    return EnrollmentModel.findOne({
      classId,
      studentId,
      status: { $in: ["invited", "active"] },
    });
  }

  async findActiveMembership(classId, studentId) {
    return EnrollmentModel.findOne({ classId, studentId, status: "active" });
  }

  async findMembershipAny(classId, studentId) {
    return EnrollmentModel.findOne({ classId, studentId });
  }

  async findInvitesByStudent(studentId) {
    return EnrollmentModel.find({ studentId, status: "invited" })
      .sort({ createdAt: -1 })
      .populate({
        path: "classId",
        select: "name courseCode lecturerId",
        populate: { path: "lecturerId", select: "firstName lastName" },
      });
  }

  async setMembershipStatus(classId, studentId, status, extra = {}) {
    return EnrollmentModel.findOneAndUpdate(
      { classId, studentId },
      { status, ...extra },
      { new: true },
    );
  }

  async addMembership(membershipData) {
    return EnrollmentModel.create(membershipData);
  }

  async removeMembership(classId, studentId) {
    return EnrollmentModel.findOneAndUpdate(
      { classId, studentId },
      { status: "removed" },
      { new: true },
    );
  }

  async incrementStudentCount(classId, delta) {
    await ClassModel.findByIdAndUpdate(classId, {
      $inc: { studentCount: delta },
    });
  }

  // Deliberately the only class field this repository lets anything write post-creation — a
  // single-field $set (never a fetch-mutate-save) so this method can never carry other fields
  // along with it, structurally reinforcing that aiInstructions is the one writable AI-config
  // surface in the system.
  async updateAiInstructions(classId, aiInstructions) {
    return ClassModel.findByIdAndUpdate(
      classId,
      { $set: { aiInstructions } },
      { new: true },
    );
  }
}

module.exports = MongoClassRepository;
