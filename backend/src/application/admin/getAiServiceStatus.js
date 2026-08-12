// Use-case: ping the MAS engine's own /health endpoint through the backend. A placeholder for
// the future AI boundary — just reachable/unreachable, no real integration yet.
const env = require("../../config/env");

async function getAiServiceStatus() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`${env.aiServiceBaseUrl}/health`, {
      signal: controller.signal,
    });
    return { reachable: response.ok };
  } catch {
    return { reachable: false };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = getAiServiceStatus;
