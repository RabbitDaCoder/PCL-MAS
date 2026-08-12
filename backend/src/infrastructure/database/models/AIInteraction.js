// Mongoose schema for the `ai_interactions` collection — a log of student/agent exchanges.
const { Schema, model, Types } = require("mongoose");

const AGENT_TYPES = ["admin", "instructor", "lecturer"];

const aiInteractionSchema = new Schema(
  {
    studentId: { type: Types.ObjectId, ref: "User", required: true },
    classId: { type: Types.ObjectId, ref: "Class" },
    agentType: { type: String, enum: AGENT_TYPES, required: true },
    message: { type: String, required: true },
    response: { type: String },
    context: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

aiInteractionSchema.index({ studentId: 1 });

const AIInteraction = model("AIInteraction", aiInteractionSchema);
AIInteraction.AGENT_TYPES = AGENT_TYPES;

module.exports = AIInteraction;
