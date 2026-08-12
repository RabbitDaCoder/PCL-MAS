// Mongoose connection lifecycle. The connection string is never hardcoded — it comes from
// the MONGODB_URI environment variable (see src/config/env.js).
const mongoose = require("mongoose");
const env = require("../../config/env");

mongoose.set("strictQuery", true);

async function connectDatabase() {
  await mongoose.connect(env.mongodbUri);
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

function checkConnection() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

module.exports = { connectDatabase, disconnectDatabase, checkConnection };
