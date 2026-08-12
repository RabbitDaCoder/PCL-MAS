// Exposes a health-check endpoint used to verify the API and DB connection are up.
const { Router } = require("express");
const {
  checkConnection,
} = require("../../../infrastructure/database/connection");

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Check API and database connectivity
 *     security: []
 *     responses:
 *       200:
 *         description: API and database are healthy
 *       503:
 *         description: Database is unreachable
 */
router.get("/health", (req, res) => {
  const isConnected = checkConnection();
  res.status(isConnected ? 200 : 503).json({
    success: isConnected,
    status: isConnected ? "ok" : "degraded",
    service: "pcl-mas-backend",
    db: isConnected ? "connected" : "disconnected",
  });
});

module.exports = router;
