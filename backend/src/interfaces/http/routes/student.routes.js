// Student-only routes: profile self-service (name only — studentId is never accepted here).
const { Router } = require("express");
const controller = require("../controllers/studentController");
const createAuthenticate = require("../middlewares/authenticate");
const requireRole = require("../middlewares/role.middleware");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

router.use("/student", authenticate, requireRole("student"));

/**
 * @openapi
 * /student/profile:
 *   patch:
 *     tags: [Student]
 *     summary: Update the current student's profile (name only — studentId/email/password are not editable here)
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
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not a student
 */
router.patch("/student/profile", controller.handleUpdateProfile);

module.exports = router;
