// Mongoose schema for the `messages` collection — database foundation for the future chat experience.
const { Schema, model, Types } = require("mongoose");

const messageSchema = new Schema(
  {
    classId: { type: Types.ObjectId, ref: "Class", required: true },
    // Unset for AI/admin-authored messages — there's no User document to point at.
    senderId: { type: Types.ObjectId, ref: "User" },
    senderType: {
      type: String,
      enum: ["student", "lecturer", "admin", "ai"],
      required: true,
    },
    // Which AI agent authored this message — only set when senderType is "ai", so the chat UI
    // can show which agent is actually speaking instead of a single generic AI identity.
    aiAgent: {
      type: String,
      enum: ["Admin", "Instructor", "Lecturer", "System"],
    },
    recipientId: { type: Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    messageType: {
      type: String,
      enum: [
        "text",
        "file",
        "announcement",
        "ai_response",
        "assignment",
        "system",
      ],
      default: "text",
    },
    attachments: [{ type: String }],
  },
  { timestamps: true },
);

messageSchema.index({ classId: 1 });

module.exports = model("Message", messageSchema);
