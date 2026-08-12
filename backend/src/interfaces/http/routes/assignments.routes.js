// Assignment/task routes — lecturer creates, students submit, lecturer grades. Nested under /classes.
const { Router } = require("express");
const controller = require("../controllers/assignmentController");
const createAuthenticate = require("../middlewares/authenticate");
const requireRole = require("../middlewares/role.middleware");
const uploadSubmissionFile = require("../middlewares/uploadMaterial.middleware");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

/**
 * @openapi
 * /classes/{classId}/assignments:
 *   post:
 *     tags: [Assignments]
 *     summary: Create an assignment for every active student in a class (lecturer-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Assignment created
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *   get:
 *     tags: [Assignments]
 *     summary: List assignments for a class with per-student status (lecturer-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Assignments retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 */
router.post(
  "/classes/:classId/assignments",
  authenticate,
  requireRole("lecturer"),
  controller.handleCreateAssignment,
);

router.get(
  "/classes/:classId/assignments",
  authenticate,
  requireRole("lecturer"),
  controller.handleGetClassAssignments,
);

/**
 * @openapi
 * /classes/{classId}/assignments/mine:
 *   get:
 *     tags: [Assignments]
 *     summary: List the current student's own assignments for a class
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Assignments retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 */
router.get(
  "/classes/:classId/assignments/mine",
  authenticate,
  requireRole("student"),
  controller.handleGetStudentAssignments,
);

/**
 * @openapi
 * /assignments/{assignmentId}/submit:
 *   post:
 *     tags: [Assignments]
 *     summary: Submit (or re-submit, before grading) text and/or a file for one assignment (student-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Assignment submitted
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 */
router.post(
  "/assignments/:assignmentId/submit",
  authenticate,
  requireRole("student"),
  uploadSubmissionFile,
  controller.handleSubmitAssignment,
);

/**
 * @openapi
 * /assignments/{assignmentId}/grade:
 *   post:
 *     tags: [Assignments]
 *     summary: Grade a submitted assignment (lecturer-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Assignment graded
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 */
router.post(
  "/assignments/:assignmentId/grade",
  authenticate,
  requireRole("lecturer"),
  controller.handleGradeAssignment,
);

module.exports = router;
