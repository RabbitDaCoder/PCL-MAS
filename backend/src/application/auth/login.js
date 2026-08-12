// Use-case: authenticate a user and, when a role is specified (student/lecturer/admin login
// pages each pass their own role), enforce that the account actually holds that role.
// The database is the source of truth for the user's role.
const AppError = require("../../domain/errors/AppError");
const { toPublicUser } = require("../../domain/entities/User");
const { assertRequiredFields, assertValidEmail } = require("./validators");

async function login(
  { userRepository, passwordHasher, tokenService },
  { email, password, role },
) {
  assertRequiredFields({ email, password }, ["email", "password"]);
  assertValidEmail(email);

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError("We couldn't find an account with that email.", 404);
  }

  const passwordMatches = await passwordHasher.compare(password, user.password);
  if (!passwordMatches) {
    throw new AppError("Your password is incorrect.", 401);
  }

  if (role && user.role !== role) {
    throw new AppError(`This account is not registered as a ${role}.`, 403);
  }

  const accessToken = tokenService.sign({
    sub: user.id.toString(),
    role: user.role,
  });

  return { user: toPublicUser(user), accessToken };
}

module.exports = login;
