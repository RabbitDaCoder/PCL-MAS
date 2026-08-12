// Mongoose schema for the `questions` collection — the human-in-the-loop question review queue.
const { Schema, model, Types } = require("mongoose");

const questionSchema = new Schema(
  {
    classId: { type: Types.ObjectId, ref: "Class", required: true },
    studentId: { type: Types.ObjectId, ref: "User", required: true },
    questionText: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "answered", "rejected"],
      default: "pending",
    },
    lecturerResponse: { type: String, trim: true },
    respondedAt: { type: Date },
  },
  { timestamps: true },
);

questionSchema.index({ classId: 1, status: 1 });

module.exports = model("Question", questionSchema);
