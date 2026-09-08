// Routes for the 1:1 Administrative AI direct-message channel — student-only, deliberately
// separate from class-group chat (/classes/:classId/messages).
const { Router } = require("express");
const controller = require("../controllers/directMessageController");
const createAuthenticate = require("../middlewares/authenticate");
const requireRole = require("../middlewares/role.middleware");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

/**
 * @openapi
 * /classes/{classId}/dm:
 *   get:
 *     tags: [DirectMessages]
 *     summary: The current student's own 1:1 Administrative AI thread history for a class
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thread retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: No access to this class
 */
router.get(
  "/classes/:classId/dm",
  authenticate,
  requireRole("student"),
  controller.handleGetDmThread,
);

/**
 * @openapi
 * /classes/{classId}/dm:
 *   post:
 *     tags: [DirectMessages]
 *     summary: Send a message into the current student's own 1:1 Administrative AI thread
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
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: No access to this class
 */
router.post(
  "/classes/:classId/dm",
  authenticate,
  requireRole("student"),
  controller.handleSendDmMessage,
);

/**
 * @openapi
 * /classes/{classId}/dm/{messageId}/feedback:
 *   post:
 *     tags: [DirectMessages]
 *     summary: Student rates an AI-authored message in their own 1:1 thread (thumbs up/down + optional note)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: string, enum: [up, down] }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Feedback recorded
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: No access to this class
 *       404:
 *         description: Message not found, or not an AI-authored message
 */
router.post(
  "/classes/:classId/dm/:messageId/feedback",
  authenticate,
  requireRole("student"),
  controller.handleSubmitDmMessageFeedback,
);

module.exports = router;
