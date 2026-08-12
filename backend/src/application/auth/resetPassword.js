// Use-case: complete a password reset given the raw token from the emailed link. Single-use —
// the stored token hash is cleared as soon as it's consumed.
const crypto = require("crypto");
const AppError = require("../../domain/errors/AppError");
const { assertRequiredFields, assertValidPassword } = require("./validators");

function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

async function resetPassword(
  { userRepository, passwordHasher },
  { token, password },
) {
  assertRequiredFields({ token, password }, ["token", "password"]);
  assertValidPassword(password);

  const user = await userRepository.findByResetTokenHash(hashToken(token));
  if (!user) {
    throw new AppError("This reset link is invalid or has expired.", 400);
  }

  const passwordHash = await passwordHasher.hash(password);
  await userRepository.resetPassword(user.id, passwordHash);

  return { message: "Your password has been reset. You can now sign in." };
}

module.exports = resetPassword;
