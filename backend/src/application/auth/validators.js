// Shared, framework-agnostic input validation used by the auth use-cases.
const AppError = require("../../domain/errors/AppError");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

function assertRequiredFields(payload, fields) {
  const missing = fields.filter((field) => !payload[field]);
  if (missing.length > 0) {
    throw new AppError(`Missing required field(s): ${missing.join(", ")}`, 422);
  }
}

function assertValidEmail(email) {
  if (!EMAIL_REGEX.test(email)) {
    throw new AppError("Enter a valid email address.", 422);
  }
}

function assertValidPassword(password) {
  if (!PASSWORD_REGEX.test(password)) {
    throw new AppError(
      "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.",
      422,
    );
  }
}

module.exports = {
  assertRequiredFields,
  assertValidEmail,
  assertValidPassword,
};
