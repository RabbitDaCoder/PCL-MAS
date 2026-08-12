// CORS options driven by env so the allowed origin is never hardcoded in app.js.
const env = require("./env");

module.exports = {
  origin: env.clientUrl,
};
