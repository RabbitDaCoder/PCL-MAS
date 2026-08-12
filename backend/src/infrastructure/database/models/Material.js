// Mongoose schema for the `materials` collection — metadata only; files live in object storage later.
const { Schema, model, Types } = require("mongoose");

const materialSchema = new Schema(
  {
    classId: { type: Types.ObjectId, ref: "Class", required: true },
    uploadedBy: { type: Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, trim: true },
    fileSize: { type: Number },
    // Cached by the Instructor Agent right after upload (PDFs only) so later pre-test/learning
    // path generation doesn't need to re-download and re-parse the same file each time.
    extractedText: { type: String },
    extractionStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "skipped"],
      default: "skipped",
    },
  },
  { timestamps: true },
);

materialSchema.index({ classId: 1 });

module.exports = model("Material", materialSchema);
