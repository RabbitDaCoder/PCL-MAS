// Improvement insight routes — all lecturer-only, ownership-checked. Insights are per-class,
// since they target that class's aiInstructions.
const { Router } = require("express");
const controller = require("../controllers/insightController");
const createAuthenticate = require("../middlewares/authenticate");
const requireRole = require("../middlewares/role.middleware");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

/**
 * @openapi
 * /classes/{classId}/insights/generate:
 *   post:
 *     tags: [Insights]
 *     summary: Generate improvement insights for a class from accumulated feedback/review data (lecturer-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Insight generation complete (may report "not enough data" without generating any)
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this class's lecturer
 */
router.post(
  "/classes/:classId/insights/generate",
  authenticate,
  requireRole("lecturer"),
  controller.handleGenerateInsights,
);

/**
 * @openapi
 * /classes/{classId}/insights:
 *   get:
 *     tags: [Insights]
 *     summary: List a class's improvement insights (lecturer-only, defaults to pending)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         required: false
 *         schema: { type: string, enum: [pending, approved, rejected] }
 *     responses:
 *       200:
 *         description: Insights retrieved (empty array if none)
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this class's lecturer
 */
router.get(
  "/classes/:classId/insights",
  authenticate,
  requireRole("lecturer"),
  controller.handleGetInsights,
);

/**
 * @openapi
 * /classes/{classId}/insights/{insightId}/dismiss:
 *   post:
 *     tags: [Insights]
 *     summary: Dismiss an improvement insight without applying it (lecturer-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: insightId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Insight dismissed
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this class's lecturer
 *       404:
 *         description: Insight not found
 */
router.post(
  "/classes/:classId/insights/:insightId/dismiss",
  authenticate,
  requireRole("lecturer"),
  controller.handleDismissInsight,
);

/**
 * @openapi
 * /classes/{classId}/insights/preview:
 *   post:
 *     tags: [Insights]
 *     summary: Sandboxed dry-run reply using a candidate AI-instructions change (lecturer-only, nothing persisted)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [candidateInstructions]
 *             properties:
 *               candidateInstructions: { type: string }
 *               samplePrompt: { type: string }
 *     responses:
 *       200:
 *         description: Preview generated
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this class's lecturer
 */
router.post(
  "/classes/:classId/insights/preview",
  authenticate,
  requireRole("lecturer"),
  controller.handlePreviewInsight,
);

/**
 * @openapi
 * /classes/{classId}/insights/{insightId}/apply:
 *   post:
 *     tags: [Insights]
 *     summary: Apply a (possibly edited) improvement insight to the class's AI instructions (lecturer-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: insightId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [finalInstructionText]
 *             properties:
 *               finalInstructionText: { type: string }
 *     responses:
 *       200:
 *         description: Insight applied
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this class's lecturer
 *       404:
 *         description: Insight not found
 */
router.post(
  "/classes/:classId/insights/:insightId/apply",
  authenticate,
  requireRole("lecturer"),
  controller.handleApplyInsight,
);

module.exports = router;
