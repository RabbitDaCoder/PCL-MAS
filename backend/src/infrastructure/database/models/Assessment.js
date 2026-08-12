// Mongoose schema for the `assessments` collection. Questions are embedded (no separate `questions`
// collection in V1) since they are always read/written together with their parent assessment.
const { Schema, model, Types } = require("mongoose");

const ASSESSMENT_TYPES = ["pre_test", "post_test", "assignment"];

const questionSchema = new Schema(
  {
    topic: { type: String, trim: true },
    prompt: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String },
  },
  { _id: false },
);

const assessmentSchema = new Schema(
  {
    classId: { type: Types.ObjectId, ref: "Class", required: true },
    studentId: { type: Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ASSESSMENT_TYPES, required: true },
    questions: [questionSchema],
    answers: [{ type: String }],
    score: { type: Number },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

assessmentSchema.index({ classId: 1 });
assessmentSchema.index({ studentId: 1 });

const Assessment = model("Assessment", assessmentSchema);
Assessment.ASSESSMENT_TYPES = ASSESSMENT_TYPES;

module.exports = Assessment;
