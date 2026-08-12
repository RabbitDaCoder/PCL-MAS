// Error type carrying an HTTP status, understood by the shared Express error handler.
class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

module.exports = AppError;
