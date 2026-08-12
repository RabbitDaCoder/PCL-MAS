// Role authorization guard, used after `authenticate` so req.user is already populated.
const AppError = require("../../../domain/errors/AppError");

function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403),
      );
    }
    next();
  };
}

module.exports = requireRole;
