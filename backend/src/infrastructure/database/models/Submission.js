// Mongoose schema for the `submissions` collection — separates an assessment definition
// (which may be given to many students) from each student's individual attempt.
const { Schema, model, Types } = require("mongoose");

const submissionSchema = new Schema(
  {
    assessmentId: { type: Types.ObjectId, ref: "Assessment", required: true },
    studentId: { type: Types.ObjectId, ref: "User", required: true },
    answers: { type: Schema.Types.Mixed },
    score: { type: Number },
    feedback: { type: String },
    submittedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

submissionSchema.index({ assessmentId: 1 });
submissionSchema.index({ studentId: 1 });

module.exports = model("Submission", submissionSchema);
