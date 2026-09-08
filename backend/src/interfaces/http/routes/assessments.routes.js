// Assessment routes (pre-test/post-test) — generate/fetch/submit, nested under /classes.
// :type is "pre-test" or "post-test" — reused as-is for post-test generation later.
const { Router } = require("express");
const controller = require("../controllers/assessmentController");
const createAuthenticate = require("../middlewares/authenticate");
const requireRole = require("../middlewares/role.middleware");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

/**
 * @openapi
 * /classes/{classId}/assessments/{type}/generate:
 *   post:
 *     tags: [Assessments]
 *     summary: Generate a pre-test/post-test for a class from its topics, objectives and materials (lecturer-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [pre-test, post-test] }
 *     responses:
 *       201:
 *         description: Assessment generated
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this class's lecturer
 *       409:
 *         description: Already generated for this class
 */
router.post(
  "/classes/:classId/assessments/:type/generate",
  authenticate,
  requireRole("lecturer"),
  controller.handleGenerateAssessment,
);

/**
 * @openapi
 * /classes/{classId}/assessments/{type}:
 *   get:
 *     tags: [Assessments]
 *     summary: Get an assessment (student's own attempt, or lecturer's completion stats)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [pre-test, post-test] }
 *     responses:
 *       200:
 *         description: Assessment retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: No access to this class
 */
router.get(
  "/classes/:classId/assessments/:type",
  authenticate,
  requireRole("lecturer", "student"),
  controller.handleGetAssessment,
);

/**
 * @openapi
 * /classes/{classId}/assessments/{type}/submit:
 *   post:
 *     tags: [Assessments]
 *     summary: Submit a student's answers for an assessment (student-only, server-graded)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [pre-test, post-test] }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Assessment submitted
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       404:
 *         description: Assessment not generated yet
 *       409:
 *         description: Already submitted
 */
router.post(
  "/classes/:classId/assessments/:type/submit",
  authenticate,
  requireRole("student"),
  controller.handleSubmitAssessment,
);

/**
 * @openapi
 * /classes/{classId}/assessments/{type}/review:
 *   post:
 *     tags: [Assessments]
 *     summary: Approve or reject a drafted pre-test/post-test (lecturer-only) — approving may include edited questions
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [pre-test, post-test] }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision]
 *             properties:
 *               decision: { type: string, enum: [approve, reject] }
 *               questions:
 *                 type: array
 *                 description: Optional edited question set, applied only when approving.
 *               feedback:
 *                 type: string
 *                 description: Optional free-text reason for the decision, stored on the assessment.
 *     responses:
 *       200:
 *         description: Assessment review updated
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       404:
 *         description: This assessment hasn't been generated yet
 */
router.post(
  "/classes/:classId/assessments/:type/review",
  authenticate,
  requireRole("lecturer"),
  controller.handleReviewAssessment,
);

module.exports = router;
