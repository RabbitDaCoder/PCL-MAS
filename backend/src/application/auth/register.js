// Use-case: register a new student or lecturer (no admin self-registration).
// Shared across both roles to avoid duplicating the create/hash/token logic.
const AppError = require("../../domain/errors/AppError");
const { ROLES, toPublicUser } = require("../../domain/entities/User");
const {
  assertRequiredFields,
  assertValidEmail,
  assertValidPassword,
} = require("./validators");

const ROLE_SPECIFIC_FIELDS = {
  [ROLES.STUDENT]: ["studentId", "institution", "department", "academicLevel"],
  [ROLES.LECTURER]: ["institution", "department", "faculty", "academicRole"],
};

async function register(
  { userRepository, passwordHasher, tokenService },
  payload,
) {
  const { role } = payload;

  if (role === ROLES.ADMIN) {
    throw new AppError("Admin accounts cannot be self-registered.", 403);
  }
  if (!ROLE_SPECIFIC_FIELDS[role]) {
    throw new AppError("role must be either student or lecturer.", 422);
  }

  const roleFields = ROLE_SPECIFIC_FIELDS[role];
  assertRequiredFields(payload, [
    "firstName",
    "lastName",
    "email",
    "password",
    ...roleFields,
  ]);
  assertValidEmail(payload.email);
  assertValidPassword(payload.password);

  const existing = await userRepository.findByEmail(payload.email);
  if (existing) {
    throw new AppError("This email is already registered.", 409);
  }

  const passwordHash = await passwordHasher.hash(payload.password);

  const user = await userRepository.create({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email.toLowerCase(),
    password: passwordHash,
    role,
    ...Object.fromEntries(roleFields.map((field) => [field, payload[field]])),
  });

  const accessToken = tokenService.sign({
    sub: user.id.toString(),
    role: user.role,
  });

  return { user: toPublicUser(user), accessToken };
}

module.exports = register;
