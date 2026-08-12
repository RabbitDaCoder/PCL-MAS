// Use-case: fetch the MAS engine's own /health payload (per-agent config status) and forward it
// verbatim — a thin passthrough, not a real AI integration.
const env = require("../../config/env");

async function getAiStatus() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`${env.aiServiceBaseUrl}/health`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      return { status: "unreachable", agents: null };
    }
    return await response.json();
  } catch {
    return { status: "unreachable", agents: null };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = getAiStatus;
