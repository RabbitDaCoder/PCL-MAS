// Mongoose schema for the `assignments` collection — createdBy distinguishes lecturer-authored
// assignments from ones the Instructor AI generates.
const { Schema, model, Types } = require("mongoose");

const assignmentSchema = new Schema(
  {
    classId: { type: Types.ObjectId, ref: "Class", required: true },
    studentId: { type: Types.ObjectId, ref: "User" },
    // Shared by every per-student row created from the same lecturer action — lets the lecturer
    // view group them back into one assignment with per-student statuses.
    groupId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    instructions: { type: String },
    resources: [{ type: String }],
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "in_progress", "submitted", "graded"],
      default: "pending",
    },
    submissionText: { type: String },
    submissionFileUrl: { type: String },
    submissionFileType: { type: String },
    submittedAt: { type: Date },
    score: { type: Number },
    feedback: { type: String },
    createdBy: { type: String, enum: ["lecturer", "ai"], required: true },
  },
  { timestamps: true },
);

assignmentSchema.index({ classId: 1 });
assignmentSchema.index({ studentId: 1 });

module.exports = model("Assignment", assignmentSchema);
