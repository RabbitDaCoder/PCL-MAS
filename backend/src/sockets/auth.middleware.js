// Socket.io connection-level auth — verifies the same JWT REST uses, no separate weaker path.
// Rejects the connection outright (no anonymous sockets) if the token is missing/invalid.
const tokenService = require("../infrastructure/security/tokenService");
const MongoUserRepository = require("../infrastructure/repositories/MongoUserRepository");

const userRepository = new MongoUserRepository();

async function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("No session token provided."));
    }

    const payload = tokenService.verify(token);
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      return next(new Error("Invalid or expired session."));
    }

    socket.user = { id: user.id.toString(), role: user.role };
    next();
  } catch {
    next(new Error("Invalid or expired session."));
  }
}

module.exports = socketAuthMiddleware;
