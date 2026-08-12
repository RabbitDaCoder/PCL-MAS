// Admin-only routes: simple aggregate stats, recent users, and an AI-service reachability check.
const { Router } = require("express");
const controller = require("../controllers/adminController");
const createAuthenticate = require("../middlewares/authenticate");
const requireRole = require("../middlewares/role.middleware");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

router.use("/admin", authenticate, requireRole("admin"));

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Aggregate user/class counts (admin-only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Stats retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not an admin
 */
router.get("/admin/stats", controller.handleGetStats);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Last 5 registered users (admin-only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Recent users retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not an admin
 */
router.get("/admin/users", controller.handleGetRecentUsers);

/**
 * @openapi
 * /admin/ai-status:
 *   get:
 *     tags: [Admin]
 *     summary: Whether the MAS engine's /health endpoint is currently reachable (admin-only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: AI service status retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not an admin
 */
router.get("/admin/ai-status", controller.handleGetAiStatus);

/**
 * @openapi
 * /admin/users/list:
 *   get:
 *     tags: [Admin]
 *     summary: Paginated/searchable/filterable user list (admin-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [student, lecturer, admin] }
 *     responses:
 *       200:
 *         description: Users retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not an admin
 */
router.get("/admin/users/list", controller.handleGetUsersList);

/**
 * @openapi
 * /admin/classes:
 *   get:
 *     tags: [Admin]
 *     summary: All classes overview (admin-only, empty array until class creation ships)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Classes retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not an admin
 */
router.get("/admin/classes", controller.handleGetClassesOverview);

/**
 * @openapi
 * /admin/system:
 *   get:
 *     tags: [Admin]
 *     summary: Basic backend/DB/environment info (admin-only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: System info retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not an admin
 */
router.get("/admin/system", controller.handleGetSystemInfo);

module.exports = router;
