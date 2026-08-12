// Use-case: paginated/searchable/filterable user list for the admin Users page (separate from
// getRecentUsers, which stays a fixed-size preview for the dashboard home).
function toUserRow(user) {
  return {
    id: user.id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    isActive: user.isActive,
  };
}

async function getUsersList(
  { userRepository },
  { page = 1, limit = 20, search = "", role = "" } = {},
) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

  const { users, total } = await userRepository.findPaginated({
    page: safePage,
    limit: safeLimit,
    search: search.trim(),
    role: role.trim(),
  });

  return {
    users: users.map(toUserRow),
    total,
    page: safePage,
    limit: safeLimit,
  };
}

module.exports = getUsersList;
