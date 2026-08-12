// Use-case: the last N registered users, for the admin "recent users" list.
function toRecentUserSummary(user) {
  return {
    id: user.id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    createdAt: user.createdAt,
  };
}

async function getRecentUsers({ userRepository }, { limit = 5 } = {}) {
  const users = await userRepository.findRecent(limit);
  return users.map(toRecentUserSummary);
}

module.exports = getRecentUsers;
