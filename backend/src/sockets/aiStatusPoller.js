// Polls the MAS engine's /health on an interval and only emits admin:ai-status:update when the
// per-agent configured/reachability status actually changed since the last poll — not on every
// tick, so idle admins aren't flooded with identical events.
const getAiStatus = require("../application/ai/getAiStatus");
const { emitAdminAiStatusUpdate } = require("./emitters");

const POLL_INTERVAL_MS = 20000;

let lastStatusJson = null;
let intervalHandle = null;

async function pollOnce() {
  const status = await getAiStatus();
  const statusJson = JSON.stringify(status);
  if (statusJson !== lastStatusJson) {
    lastStatusJson = statusJson;
    emitAdminAiStatusUpdate(status);
  }
}

function startAiStatusPoller() {
  if (intervalHandle) return;
  pollOnce();
  intervalHandle = setInterval(pollOnce, POLL_INTERVAL_MS);
}

function stopAiStatusPoller() {
  clearInterval(intervalHandle);
  intervalHandle = null;
}

module.exports = { startAiStatusPoller, stopAiStatusPoller };
