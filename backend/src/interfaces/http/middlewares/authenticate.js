// Verifies the Bearer JWT and attaches the current user to req.user. The database is the
// source of truth for the user's role, so req.user.role always reflects the stored role.
const AppError = require("../../../domain/errors/AppError");
const validateToken = require("../../../application/auth/validateToken");

function createAuthenticate(deps) {
  return async function authenticate(req, res, next) {
    try {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : null;
      if (!token) {
        throw new AppError("No session token provided.", 401);
      }
      req.user = await validateToken(deps, token);
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = createAuthenticate;
