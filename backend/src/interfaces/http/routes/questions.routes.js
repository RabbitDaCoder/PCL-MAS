// Top-level question review routes — questions across all of a lecturer's classes.
const { Router } = require("express");
const controller = require("../controllers/questionsController");
const createAuthenticate = require("../middlewares/authenticate");
const requireRole = require("../middlewares/role.middleware");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

/**
 * @openapi
 * /questions:
 *   get:
 *     tags: [Questions]
 *     summary: All questions across the current lecturer's classes, optionally filtered by status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, answered, rejected] }
 *     responses:
 *       200:
 *         description: Questions retrieved (empty array if none)
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not a lecturer
 */
router.get(
  "/questions",
  authenticate,
  requireRole("lecturer"),
  controller.handleGetQuestions,
);

/**
 * @openapi
 * /questions/mine:
 *   get:
 *     tags: [Questions]
 *     summary: The current student's own question history across all their classes
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Questions retrieved (empty array if none)
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not a student
 */
router.get(
  "/questions/mine",
  authenticate,
  requireRole("student"),
  controller.handleGetMyQuestions,
);

/**
 * @openapi
 * /questions:
 *   post:
 *     tags: [Questions]
 *     summary: Submit a question to a class (student-only, must be an active member)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [classId, questionText]
 *             properties:
 *               classId: { type: string }
 *               questionText: { type: string }
 *     responses:
 *       201:
 *         description: Question submitted
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not an active member of this class
 */
router.post(
  "/questions",
  authenticate,
  requireRole("student"),
  controller.handleSubmitQuestion,
);

/**
 * @openapi
 * /questions/{questionId}:
 *   patch:
 *     tags: [Questions]
 *     summary: Respond to a question — approve (answered) or reject it
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [answered, rejected] }
 *               lecturerResponse: { type: string }
 *     responses:
 *       200:
 *         description: Question updated
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this question's class lecturer
 *       404:
 *         description: Question not found
 */
router.patch(
  "/questions/:questionId",
  authenticate,
  requireRole("lecturer"),
  controller.handleRespondToQuestion,
);

module.exports = router;
