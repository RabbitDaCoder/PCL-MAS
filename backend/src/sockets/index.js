// Socket.io server init — attaches to the same HTTP server Express uses, same CORS as REST.
const { Server } = require("socket.io");
const corsOptions = require("../config/cors");
const initAdminNamespace = require("./namespaces/admin.namespace");
const initClassesNamespace = require("./namespaces/classes.namespace");
const { startAiStatusPoller, stopAiStatusPoller } = require("./aiStatusPoller");

function initSockets(httpServer) {
  const io = new Server(httpServer, { cors: corsOptions });

  initAdminNamespace(io);
  initClassesNamespace(io);
  startAiStatusPoller();

  return io;
}

module.exports = { initSockets, stopAiStatusPoller };
