// Use-case: request a password reset. Always responds the same way regardless of whether the
// email is registered, so callers can never use this endpoint to enumerate accounts.
const crypto = require("crypto");
const env = require("../../config/env");
const { assertRequiredFields, assertValidEmail } = require("./validators");
const mailer = require("../../infrastructure/mailer/mailer");

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

async function forgotPassword({ userRepository }, { email }) {
  assertRequiredFields({ email }, ["email"]);
  assertValidEmail(email);

  const user = await userRepository.findByEmail(email);
  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    await userRepository.setResetToken(
      user.id,
      hashToken(rawToken),
      new Date(Date.now() + RESET_TOKEN_TTL_MS),
    );
    const resetUrl = `${env.clientUrl}/reset-password/${rawToken}`;
    await mailer.sendPasswordResetEmail({ to: user.email, resetUrl });
  }

  return {
    message:
      "If that email is registered, a password reset link has been sent.",
  };
}

module.exports = forgotPassword;
