// Builds and configures the Express application (middleware + routes), without starting a server.
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const env = require("./config/env");
const corsOptions = require("./config/cors");
const swaggerSpec = require("./config/swagger");
const routes = require("./interfaces/http/routes");
const errorHandler = require("./interfaces/http/middlewares/errorHandler");
const {
  generalLimiter,
} = require("./interfaces/http/middlewares/rateLimit.middleware");

function createApp() {
  const app = express();

  // Swagger UI needs inline scripts/styles, so it gets a relaxed CSP; every other
  // route below still gets the full default helmet() protection.
  app.use(
    "/api/v1/docs",
    helmet({ contentSecurityPolicy: false }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
  );
  app.get("/api/v1/docs.json", helmet(), (req, res) => res.json(swaggerSpec));

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json());
  // Debug-mode request logging: logs method, path, status and timing for every request.
  if (env.nodeEnv !== "test") {
    app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  }

  app.use("/api/v1", generalLimiter, routes);

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
