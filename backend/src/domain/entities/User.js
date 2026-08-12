// Framework-agnostic user concepts shared by the application and infrastructure layers.
const ROLES = Object.freeze({
  STUDENT: "student",
  LECTURER: "lecturer",
  ADMIN: "admin",
});

function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}

// Strips password/internal fields before a user is ever sent to the client.
function toPublicUser(user) {
  return {
    id: (user.id ?? user._id)?.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    department: user.department ?? null,
    institution: user.institution ?? null,
    studentId: user.studentId ?? null,
    createdAt: user.createdAt,
    isActive: user.isActive,
  };
}

module.exports = { ROLES, isValidRole, toPublicUser };
