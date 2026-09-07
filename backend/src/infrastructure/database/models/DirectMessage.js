// Mongoose schema for the `direct_messages` collection — a student's private 1:1 channel per
// class. Deliberately separate from the class-group `Message` model: group chat and this
// personal channel are different surfaces with different audiences, so keeping them in separate
// collections makes that boundary structural instead of something the UI has to filter. Any AI
// agent (Admin, Instructor, or Lecturer) may reply here, not just Admin — the student can call a
// specific one's attention with "@agent" the same way they can in class-group chat.
const { Schema, model, Types } = require("mongoose");

const directMessageSchema = new Schema(
  {
    studentId: { type: Types.ObjectId, ref: "User", required: true },
    classId: { type: Types.ObjectId, ref: "Class", required: true },
    senderType: {
      type: String,
      enum: ["student", "ai"],
      required: true,
    },
    // Which AI agent authored this message — only set when senderType is "ai".
    aiAgent: {
      type: String,
      enum: ["Admin", "Instructor", "Lecturer", "System"],
    },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

directMessageSchema.index({ studentId: 1, classId: 1, createdAt: 1 });

module.exports = model("DirectMessage", directMessageSchema);
