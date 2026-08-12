// Mongoose schema for the `agent_tasks` collection — prepares the backend to track CrewAI task runs.
const { Schema, model, Types } = require("mongoose");

const agentTaskSchema = new Schema(
  {
    classId: { type: Types.ObjectId, ref: "Class" },
    studentId: { type: Types.ObjectId, ref: "User" },
    agentType: {
      type: String,
      enum: ["admin", "instructor", "lecturer"],
      required: true,
    },
    taskType: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed", "requires_review"],
      default: "pending",
    },
    input: { type: Schema.Types.Mixed },
    output: { type: Schema.Types.Mixed },
    completedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

agentTaskSchema.index({ classId: 1 });
agentTaskSchema.index({ studentId: 1 });

module.exports = model("AgentTask", agentTaskSchema);
