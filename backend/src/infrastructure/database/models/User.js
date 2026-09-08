// Mongoose schema for the `users` collection — the single source of truth for role.
const { Schema, model } = require("mongoose");
const { ROLES } = require("../../../domain/entities/User");

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."],
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), required: true },
    institution: { type: String, trim: true },
    department: { type: String, trim: true },
    studentId: { type: String, trim: true },
    academicLevel: { type: String, trim: true },
    faculty: { type: String, trim: true },
    academicRole: { type: String, trim: true },
    profileImage: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    bio: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    onboardingCompleted: { type: Boolean, default: false },
    // Login-frequency analytics — updated on every successful login (see application/auth/login.js).
    lastLoginAt: { type: Date },
    loginCount: { type: Number, default: 0 },
    // Hashed (never the raw token) + expiry for the forgot/reset-password flow.
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    // Populated/updated by the AI service later — kept intentionally simple for V1.
    learningProfile: {
      interests: [{ type: String, trim: true }],
      preferredLearningStyle: { type: String, trim: true },
      strengths: [{ type: String, trim: true }],
      weaknesses: [{ type: String, trim: true }],
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });

module.exports = model("User", userSchema);
