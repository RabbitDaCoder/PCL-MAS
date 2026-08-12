// Standard success envelope: { success, data, message }. Errors are formatted centrally by errorHandler.
function success(data, message = "Operation successful") {
  return { success: true, data, message };
}

module.exports = { success };
