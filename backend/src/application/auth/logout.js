// Use-case: log out. JWTs are stateless and there is no refresh-token/cookie store yet, so
// there is nothing server-side to invalidate — the client is responsible for discarding its
// token. This exists for API-contract completeness and future compatibility.
async function logout() {
  return { message: "Logged out." };
}

module.exports = logout;
