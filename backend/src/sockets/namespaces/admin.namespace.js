// Admin-only namespace — pushes live stats/AI-status/new-user events to connected admins.
// Reuses the shared JWT auth middleware, then rejects any non-admin connection at handshake
// (mirrors requireRole for REST — no weaker socket-only auth path).
const socketAuthMiddleware = require("../auth.middleware");
const { registerAdminNamespace } = require("../emitters");

function initAdminNamespace(io) {
  const namespace = io.of("/admin");

  namespace.use(socketAuthMiddleware);
  namespace.use((socket, next) => {
    if (socket.user.role !== "admin") {
      return next(new Error("Admin role required."));
    }
    next();
  });

  namespace.on("connection", () => {
    // No client->server events yet — this namespace only pushes server-initiated updates.
  });

  registerAdminNamespace(namespace);
  return namespace;
}

module.exports = initAdminNamespace;
