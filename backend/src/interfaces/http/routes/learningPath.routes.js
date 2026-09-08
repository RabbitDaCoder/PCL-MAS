// Learning path routes — AI-generated personalized study plan from a student's pre-test.
const { Router } = require("express");
const controller = require("../controllers/learningPathController");
const createAuthenticate = require("../middlewares/authenticate");
const requireRole = require("../middlewares/role.middleware");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

/**
 * @openapi
 * /classes/{classId}/learning-path/generate:
 *   post:
 *     tags: [LearningPath]
 *     summary: Generate the caller's personalized learning path from their completed pre-test (student-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Learning path generated
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       400:
 *         description: Pre-test not completed yet
 */
router.post(
  "/classes/:classId/learning-path/generate",
  authenticate,
  requireRole("student"),
  controller.handleGenerateLearningPath,
);

/**
 * @openapi
 * /classes/{classId}/learning-path:
 *   get:
 *     tags: [LearningPath]
 *     summary: Get a learning path (student's own, or a lecturer viewing a specific student via ?studentId=)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: studentId
 *         required: false
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Learning path retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: No access to this class
 */
router.get(
  "/classes/:classId/learning-path",
  authenticate,
  requireRole("lecturer", "student"),
  controller.handleGetLearningPath,
);

/**
 * @openapi
 * /classes/{classId}/learning-path/review:
 *   post:
 *     tags: [LearningPath]
 *     summary: Approve or reject a student's AI-generated learning path (lecturer-only). Reject regenerates a fresh one.
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
 *             properties:
 *               studentId: { type: string }
 *               decision: { type: string, enum: [approve, reject] }
 *               feedback:
 *                 type: string
 *                 description: Optional free-text reason for the decision, stored on the profile.
 *     responses:
 *       200:
 *         description: Learning path reviewed
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 */
router.post(
  "/classes/:classId/learning-path/review",
  authenticate,
  requireRole("lecturer"),
  controller.handleReviewLearningPath,
);

module.exports = router;
