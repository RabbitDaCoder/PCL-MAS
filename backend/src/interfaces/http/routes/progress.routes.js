// Progress routes — engagement stats + AI LearningProfile insights, nested under /classes.
const { Router } = require("express");
const controller = require("../controllers/progressController");
const createAuthenticate = require("../middlewares/authenticate");
const requireRole = require("../middlewares/role.middleware");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

/**
 * @openapi
 * /classes/{classId}/progress:
 *   get:
 *     tags: [Progress]
 *     summary: Per-student progress for a class (lecturer owner only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Progress retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this class's lecturer
 */
router.get(
  "/classes/:classId/progress",
  authenticate,
  requireRole("lecturer"),
  controller.handleGetClassProgress,
);

/**
 * @openapi
 * /classes/{classId}/progress/me:
 *   get:
 *     tags: [Progress]
 *     summary: The current student's own progress for a class
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Progress retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: No active membership in this class
 */
router.get(
  "/classes/:classId/progress/me",
  authenticate,
  requireRole("student"),
  controller.handleGetMyProgress,
);

module.exports = router;
