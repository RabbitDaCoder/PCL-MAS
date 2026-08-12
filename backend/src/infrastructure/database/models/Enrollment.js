// Mongoose schema for the `enrollments` collection — links a student to a class without duplicating either.
// Doubles as the ClassMembership record: an invite by email with no account yet is stored here
// with `inviteEmail` set and `studentId` unset until that person registers. "invited" means an
// existing account was invited but hasn't accepted yet; "pending" is the no-account-yet case.
const { Schema, model, Types } = require("mongoose");

const enrollmentSchema = new Schema(
  {
    classId: { type: Types.ObjectId, ref: "Class", required: true },
    studentId: { type: Types.ObjectId, ref: "User" },
    inviteEmail: { type: String, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ["pending", "invited", "active", "removed"],
      default: "pending",
    },
    joinedAt: { type: Date },
  },
  { timestamps: true },
);

enrollmentSchema.index({ studentId: 1 });
enrollmentSchema.index({ classId: 1 });
enrollmentSchema.index(
  { classId: 1, studentId: 1 },
  {
    unique: true,
    partialFilterExpression: { studentId: { $type: "objectId" } },
  },
);
enrollmentSchema.index(
  { classId: 1, inviteEmail: 1 },
  {
    unique: true,
    partialFilterExpression: { inviteEmail: { $type: "string" } },
  },
);

module.exports = model("Enrollment", enrollmentSchema);
