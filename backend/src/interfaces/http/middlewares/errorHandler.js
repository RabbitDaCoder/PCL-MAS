// Centralized Express error handler so route/controller code never formats error responses itself.
// Also translates common Mongoose errors (duplicate key, invalid ObjectId, schema validation)
// into safe, descriptive HTTP responses instead of leaking internals as a 500.
const STATUS_CODES = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION_ERROR",
  429: "RATE_LIMITED",
  500: "INTERNAL_ERROR",
};

function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  let status = err.status || 500;
  let message = err.message;

  if (err.code === 11000) {
    status = 409;
    message = "A record with that value already exists.";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid identifier.";
  } else if (err.name === "ValidationError") {
    status = 422;
    message = Object.values(err.errors)
      .map((fieldError) => fieldError.message)
      .join(" ");
  } else if (err.name === "MulterError") {
    status = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "That file is too large (50MB max)."
        : "Couldn't upload that file.";
  } else if (status === 500) {
    message = "Internal server error";
  }

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    error: { code: STATUS_CODES[status] || "ERROR" },
  });
}

module.exports = errorHandler;
