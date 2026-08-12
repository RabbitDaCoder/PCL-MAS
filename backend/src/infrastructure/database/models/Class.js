// Mongoose schema for the `classes` collection — a lecturer-owned learning class.
const { Schema, model, Types } = require("mongoose");

const ACADEMIC_LEVELS = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
  "Postgraduate",
];
const SEMESTERS = ["First Semester", "Second Semester"];
const ENROLLMENT_MODES = ["code", "approval"];

const classSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    courseCode: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subject: { type: String, trim: true },
    classCode: { type: String, trim: true, uppercase: true },
    lecturerId: { type: Types.ObjectId, ref: "User", required: true },
    materials: [{ type: Types.ObjectId, ref: "Material" }],
    studentCount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "archived"], default: "active" },
    department: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true, enum: ACADEMIC_LEVELS },
    semester: { type: String, required: true, trim: true, enum: SEMESTERS },
    academicSession: { type: String, required: true, trim: true },
    // Ordered arrays, not free text — later feed the AI learning system as structured context.
    learningObjectives: [{ type: String, trim: true }],
    topics: [{ type: String, trim: true }],
    startDate: { type: Date },
    endDate: { type: Date },
    enrollmentMode: {
      type: String,
      enum: ENROLLMENT_MODES,
      default: "code",
    },
    maxStudents: { type: Number, min: 1 },
  },
  { timestamps: true },
);

classSchema.index({ lecturerId: 1 });
classSchema.index(
  { classCode: 1 },
  { unique: true, partialFilterExpression: { classCode: { $type: "string" } } },
);

module.exports = model("Class", classSchema);
module.exports.ACADEMIC_LEVELS = ACADEMIC_LEVELS;
module.exports.SEMESTERS = SEMESTERS;
module.exports.ENROLLMENT_MODES = ENROLLMENT_MODES;
