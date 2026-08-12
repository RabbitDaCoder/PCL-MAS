// Use-case: basic system info for the admin System panel — deliberately simple per the original
// V1 rule (no elaborate ops dashboard). MAS-engine reachability is NOT duplicated here; that
// lives on the AI Service Status card.
const env = require("../../config/env");
const { checkConnection } = require("../../infrastructure/database/connection");

async function getSystemInfo() {
  return {
    nodeEnv: env.nodeEnv,
    dbConnected: checkConnection(),
  };
}

module.exports = getSystemInfo;
