// Class routes — scoped to the current user (their own classes), student and lecturer only.
const { Router } = require("express");
const controller = require("../controllers/classController");
const questionsController = require("../controllers/questionsController");
const createAuthenticate = require("../middlewares/authenticate");
const requireRole = require("../middlewares/role.middleware");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

/**
 * @openapi
 * /classes/mine:
 *   get:
 *     tags: [Classes]
 *     summary: The current user's classes (owned, if lecturer; enrolled, if student)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Classes retrieved (empty array if none)
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin accounts have no classes of their own
 */
router.get(
  "/classes/mine",
  authenticate,
  requireRole("student", "lecturer"),
  controller.handleGetMyClasses,
);

/**
 * @openapi
 * /classes:
 *   post:
 *     tags: [Classes]
 *     summary: Create a class (lecturer-only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, courseCode, department, level, semester, academicSession]
 *             properties:
 *               name: { type: string, example: "Introduction to Computer Science" }
 *               courseCode: { type: string, example: "CSC 201" }
 *               department: { type: string, example: "Computer Science" }
 *               level: { type: string, example: "200 Level" }
 *               semester: { type: string, example: "First Semester" }
 *               academicSession: { type: string, example: "2026/2027" }
 *               description: { type: string }
 *               learningObjectives:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Understand fundamental programming concepts"]
 *               topics:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Introduction to Programming", "Variables and Data Types"]
 *               aiInstructions:
 *                 type: string
 *                 description: Private standing instructions for the AI agents in this class (tone, escalation policy, etc.) — never shown to students.
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               enrollmentMode: { type: string, enum: [code, approval], default: code }
 *               classCode:
 *                 type: string
 *                 description: A code previously reserved via POST /classes/generate-code (optional — one is generated if omitted)
 *               maxStudents: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Class created
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       400:
 *         description: Missing/invalid fields
 *       403:
 *         description: Not a lecturer
 */
router.post(
  "/classes",
  authenticate,
  requireRole("lecturer"),
  controller.handleCreateClass,
);

/**
 * @openapi
 * /classes/generate-code:
 *   post:
 *     tags: [Classes]
 *     summary: Preview a unique class join code before the class exists (lecturer-only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Class code generated
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not a lecturer
 */
router.post(
  "/classes/generate-code",
  authenticate,
  requireRole("lecturer"),
  controller.handleGenerateClassCode,
);

/**
 * @openapi
 * /classes/invites:
 *   get:
 *     tags: [Classes]
 *     summary: The current student's pending class invites (lecturer-initiated, awaiting acceptance)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Invites retrieved (empty array if none)
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not a student
 */
router.get(
  "/classes/invites",
  authenticate,
  requireRole("student"),
  controller.handleGetClassInvites,
);

/**
 * @openapi
 * /classes/join:
 *   post:
 *     tags: [Classes]
 *     summary: Self-serve join a class by its class code
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [classCode]
 *             properties:
 *               classCode: { type: string }
 *     responses:
 *       201:
 *         description: Joined class
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not a student
 *       404:
 *         description: Invalid class code
 *       409:
 *         description: Already a member or has a pending invite
 */
router.post(
  "/classes/join",
  authenticate,
  requireRole("student"),
  controller.handleJoinClass,
);

/**
 * @openapi
 * /classes/{classId}:
 *   get:
 *     tags: [Classes]
 *     summary: Class workspace detail (owner lecturer, or an actively-enrolled student)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Class retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: No access to this class
 *       404:
 *         description: Class not found
 */
router.get(
  "/classes/:classId",
  authenticate,
  requireRole("student", "lecturer"),
  controller.handleGetClassDetail,
);

/**
 * @openapi
 * /classes/{classId}/students:
 *   get:
 *     tags: [Classes]
 *     summary: Enrolled/invited students for a class (owner-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Students retrieved (empty array if none)
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this class's lecturer
 *       404:
 *         description: Class not found
 */
router.get(
  "/classes/:classId/students",
  authenticate,
  requireRole("lecturer"),
  controller.handleGetClassStudents,
);

/**
 * @openapi
 * /classes/{classId}/students/invite:
 *   post:
 *     tags: [Classes]
 *     summary: Invite a student by email (active immediately if they have an account, else a pending invite is stored)
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
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       201:
 *         description: Invite sent
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this class's lecturer
 *       404:
 *         description: Class not found
 *       409:
 *         description: Already invited/enrolled
 */
router.post(
  "/classes/:classId/students/invite",
  authenticate,
  requireRole("lecturer"),
  controller.handleInviteStudent,
);

/**
 * @openapi
 * /classes/{classId}/invites/accept:
 *   post:
 *     tags: [Classes]
 *     summary: Accept a pending invite to a class (student-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invite accepted
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not a student
 *       404:
 *         description: No pending invite found
 */
router.post(
  "/classes/:classId/invites/accept",
  authenticate,
  requireRole("student"),
  controller.handleAcceptClassInvite,
);

/**
 * @openapi
 * /classes/{classId}/students/{userId}:
 *   delete:
 *     tags: [Classes]
 *     summary: Remove a student from a class (owner-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Student removed
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this class's lecturer
 *       404:
 *         description: Class or student not found
 */
router.delete(
  "/classes/:classId/students/:userId",
  authenticate,
  requireRole("lecturer"),
  controller.handleRemoveStudent,
);

/**
 * @openapi
 * /classes/{classId}/messages:
 *   get:
 *     tags: [Classes]
 *     summary: Paginated chat history for a class (owner-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Messages retrieved (empty array if none)
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this class's lecturer
 *       404:
 *         description: Class not found
 *   post:
 *     tags: [Classes]
 *     summary: Send a chat message (persists and emits class:message:new)
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
 *         description: Not this class's lecturer
 *       404:
 *         description: Class not found
 */
router.get(
  "/classes/:classId/messages",
  authenticate,
  requireRole("student", "lecturer"),
  controller.handleGetClassMessages,
);
router.post(
  "/classes/:classId/messages",
  authenticate,
  requireRole("student", "lecturer"),
  controller.handleSendClassMessage,
);
router.delete(
  "/classes/:classId/messages",
  authenticate,
  requireRole("student", "lecturer"),
  controller.handleClearClassMessages,
);

/**
 * @openapi
 * /classes/{classId}/questions/seed-test:
 *   post:
 *     tags: [Classes]
 *     summary: DEV-ONLY — seeds one test question for this class so Question Review can be exercised (development environment only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Test question seeded
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this class's lecturer
 *       404:
 *         description: Class not found, or not running in development
 */
router.post(
  "/classes/:classId/questions/seed-test",
  authenticate,
  requireRole("lecturer"),
  questionsController.handleSeedTestQuestion,
);

module.exports = router;
