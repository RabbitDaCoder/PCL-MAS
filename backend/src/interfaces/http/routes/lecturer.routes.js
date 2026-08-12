// Lecturer-only routes: dashboard stats plus the (currently empty) pending-actions/activity feeds.
const { Router } = require("express");
const controller = require("../controllers/lecturerController");
const createAuthenticate = require("../middlewares/authenticate");
const requireRole = require("../middlewares/role.middleware");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

router.use("/lecturer", authenticate, requireRole("lecturer"));

/**
 * @openapi
 * /lecturer/dashboard-stats:
 *   get:
 *     tags: [Lecturer]
 *     summary: Class/student counts across the current lecturer's classes
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Stats retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not a lecturer
 */
router.get("/lecturer/dashboard-stats", controller.handleGetDashboardStats);

/**
 * @openapi
 * /lecturer/pending-actions:
 *   get:
 *     tags: [Lecturer]
 *     summary: Items requiring lecturer action (empty until question review ships)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Pending actions retrieved (empty array if none)
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not a lecturer
 */
router.get("/lecturer/pending-actions", controller.handleGetPendingActions);

/**
 * @openapi
 * /lecturer/activity:
 *   get:
 *     tags: [Lecturer]
 *     summary: Recent student activity across the lecturer's classes (empty for now)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Activity retrieved (empty array if none)
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not a lecturer
 */
router.get("/lecturer/activity", controller.handleGetActivity);

/**
 * @openapi
 * /lecturer/profile:
 *   patch:
 *     tags: [Lecturer]
 *     summary: Update the current lecturer's profile (name/department/institution only — not email/password)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               department: { type: string }
 *               institution: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not a lecturer
 */
router.patch("/lecturer/profile", controller.handleUpdateProfile);

module.exports = router;
