// Mongoose schema for the `direct_messages` collection — the 1:1 Administrative AI channel per
// student per class. Deliberately separate from the class-group `Message` model: group chat and
// this personal channel are different surfaces with different audiences, so keeping them in
// separate collections makes that boundary structural instead of something the UI has to filter.
const { Schema, model, Types } = require("mongoose");

const directMessageSchema = new Schema(
  {
    studentId: { type: Types.ObjectId, ref: "User", required: true },
    classId: { type: Types.ObjectId, ref: "Class", required: true },
    sender: {
      type: String,
      enum: ["student", "administrative-ai"],
      required: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

directMessageSchema.index({ studentId: 1, classId: 1, createdAt: 1 });

module.exports = model("DirectMessage", directMessageSchema);
