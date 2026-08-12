// Use-case: validate a JWT (GET /api/auth/validate) and return the current user, if still valid.
const AppError = require("../../domain/errors/AppError");
const { toPublicUser } = require("../../domain/entities/User");

async function validateToken({ userRepository, tokenService }, token) {
  let payload;
  try {
    payload = tokenService.verify(token);
  } catch {
    throw new AppError(
      "Invalid or expired session. Please sign in again.",
      401,
    );
  }

  const user = await userRepository.findById(payload.sub);
  if (!user) {
    throw new AppError(
      "Invalid or expired session. Please sign in again.",
      401,
    );
  }

  return toPublicUser(user);
}

module.exports = validateToken;
