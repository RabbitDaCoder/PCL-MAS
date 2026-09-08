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

// A snapshot of the profile's prior state, captured just before it's overwritten by a
// regeneration — see MongoLearningProfileRepository.upsertWithHistory. Without this, every
// reject-and-regenerate or student-initiated regenerate silently destroyed the previous version.
const learningProfileHistoryEntrySchema = new Schema(
  {
    steps: [learningPathStepSchema],
    summary: { type: String, trim: true },
    weaknesses: [{ type: String }],
    knowledgeGaps: [{ type: String }],
    reviewStatus: { type: String, enum: ["pending", "approved", "rejected"] },
    reviewedBy: { type: Types.ObjectId, ref: "User" },
    replacedAt: { type: Date, default: Date.now },
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
    // Intentionally never populated: nothing in this system observes how a student prefers to
    // learn (no content-format tracking, no learning-style survey). Left in the schema rather
    // than removed, but no write path sets it — populating it would mean fabricating data.
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
    reviewFeedback: { type: String, trim: true },
    history: [learningProfileHistoryEntrySchema],
  },
  { timestamps: true },
);

learningProfileSchema.index({ studentId: 1, classId: 1 }, { unique: true });

module.exports = model("LearningProfile", learningProfileSchema);
