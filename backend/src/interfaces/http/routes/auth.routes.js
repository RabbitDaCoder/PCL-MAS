// Auth routes. A single register/login endpoint takes `role` in the body; the database is
// always the source of truth (login rejects a mismatched role, register rejects "admin").
const { Router } = require("express");
const controller = require("../controllers/authController");
const createAuthenticate = require("../middlewares/authenticate");
const { authLimiter } = require("../middlewares/rateLimit.middleware");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a student or lecturer (admin self-registration is rejected)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, role]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               role: { type: string, enum: [student, lecturer] }
 *               studentId: { type: string, description: "Required when role=student" }
 *               institution: { type: string }
 *               department: { type: string }
 *               academicLevel: { type: string, description: "Required when role=student" }
 *               faculty: { type: string, description: "Required when role=lecturer" }
 *               academicRole: { type: string, description: "Required when role=lecturer" }
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Admin self-registration attempted
 *       409:
 *         description: Email already registered
 *       422:
 *         description: Validation error
 */
router.post("/auth/register", authLimiter, controller.handleRegister);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email/password (role is optional and must match the stored role)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               role: { type: string, enum: [student, lecturer, admin] }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Role mismatch
 */
router.post("/auth/login", authLimiter, controller.handleLogin);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the currently authenticated user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       401:
 *         description: Missing or invalid token
 */
router.get("/auth/me", authenticate, controller.handleMe);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset link (always returns a generic success message)
 *     security: []
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
 *       200:
 *         description: Generic confirmation, whether or not the email is registered
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 */
router.post(
  "/auth/forgot-password",
  authLimiter,
  controller.handleForgotPassword,
);

/**
 * @openapi
 * /auth/reset-password/{token}:
 *   post:
 *     tags: [Auth]
 *     summary: Complete a password reset using the token emailed by /auth/forgot-password
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       400:
 *         description: Token invalid or expired
 *       422:
 *         description: Validation error
 */
router.post(
  "/auth/reset-password/:token",
  authLimiter,
  controller.handleResetPassword,
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out (stateless JWT — the client discards its token)
 *     security: []
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 */
router.post("/auth/logout", controller.handleLogout);

module.exports = router;
