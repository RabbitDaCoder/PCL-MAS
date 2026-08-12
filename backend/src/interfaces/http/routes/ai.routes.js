// Thin passthrough to the MAS engine's per-agent health/configuration status.
const { Router } = require("express");
const controller = require("../controllers/aiController");
const createAuthenticate = require("../middlewares/authenticate");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

/**
 * @openapi
 * /ai/status:
 *   get:
 *     tags: [AI]
 *     summary: Per-agent MAS engine configuration/reachability status (passthrough)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: AI status retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 */
router.get("/ai/status", authenticate, controller.handleGetStatus);

module.exports = router;
