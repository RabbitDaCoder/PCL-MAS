// Mongoose schema for the `approvals` collection — human-in-the-loop review of AI-generated content.
const { Schema, model, Types } = require("mongoose");

const approvalSchema = new Schema(
  {
    classId: { type: Types.ObjectId, ref: "Class" },
    studentId: { type: Types.ObjectId, ref: "User" },
    requestedBy: { type: Types.ObjectId, ref: "User" },
    requestType: { type: String, required: true },
    content: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "edited"],
      default: "pending",
    },
    lecturerFeedback: { type: String },
    reviewedBy: { type: Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

approvalSchema.index({ classId: 1 });
approvalSchema.index({ studentId: 1 });

module.exports = model("Approval", approvalSchema);
