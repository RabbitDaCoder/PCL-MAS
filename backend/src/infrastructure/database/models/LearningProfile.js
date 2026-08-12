// Mongoose schema for the `learning_profiles` collection — kept intentionally simple for V1.
const { Schema, model, Types } = require("mongoose");

const learningPathStepSchema = new Schema(
  {
    topic: { type: String, trim: true },
    priority: { type: String, enum: ["high", "medium", "low"] },
    recommendation: { type: String, trim: true },
  },
  { _id: false },
);

const learningProfileSchema = new Schema(
  {
    studentId: { type: Types.ObjectId, ref: "User", required: true },
    classId: { type: Types.ObjectId, ref: "Class", required: true },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    knowledgeGaps: [{ type: String }],
    learningPace: { type: String },
    preferredLearningMethods: [{ type: String }],
    recommendedTopics: [{ type: String }],
    learningPathSteps: [learningPathStepSchema],
    progressSummary: { type: String },
    lastAssessmentScore: { type: Number },
    // Part G: lecturer must approve an AI-generated path before the student can see it.
    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
    },
    reviewedAt: { type: Date },
    reviewedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

learningProfileSchema.index({ studentId: 1, classId: 1 }, { unique: true });

module.exports = model("LearningProfile", learningProfileSchema);
