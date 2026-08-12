// Process entry point: wires up config, connects to MongoDB, then starts listening.
// The server never starts if the database connection fails — no silent partial startup.
const http = require("http");
const env = require("./src/config/env");
const createApp = require("./src/app");
const {
  connectDatabase,
  disconnectDatabase,
} = require("./src/infrastructure/database/connection");
const { initSockets, stopAiStatusPoller } = require("./src/sockets");

async function start() {
  try {
    await connectDatabase();
    console.log("Connected to MongoDB.");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }

  const app = createApp();
  // Socket.io needs the raw http.Server so it can share the same port as Express.
  const httpServer = http.createServer(app);
  initSockets(httpServer);

  const server = httpServer.listen(env.port, () => {
    console.log(`Backend listening on port ${env.port} (${env.nodeEnv})`);
  });

  async function shutdown(signal) {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    stopAiStatusPoller();
    server.close(async () => {
      await disconnectDatabase();
      console.log("Shutdown complete.");
      process.exit(0);
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start();
