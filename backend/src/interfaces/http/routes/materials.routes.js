// Material routes — file upload/list/delete for a class's materials, nested under /classes.
const { Router } = require("express");
const controller = require("../controllers/materialController");
const createAuthenticate = require("../middlewares/authenticate");
const requireRole = require("../middlewares/role.middleware");
const uploadMaterialFile = require("../middlewares/uploadMaterial.middleware");

const authenticate = createAuthenticate(controller.deps);
const router = Router();

/**
 * @openapi
 * /classes/{classId}/materials:
 *   get:
 *     tags: [Materials]
 *     summary: List a class's materials (lecturer owner or an active student member)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Materials retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: No access to this class
 *   post:
 *     tags: [Materials]
 *     summary: Upload a material to a class (lecturer-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, title]
 *             properties:
 *               file: { type: string, format: binary }
 *               title: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Material uploaded
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       400:
 *         description: Missing/invalid file or title
 *       403:
 *         description: Not this class's lecturer
 */
router.get(
  "/classes/:classId/materials",
  authenticate,
  requireRole("student", "lecturer"),
  controller.handleGetClassMaterials,
);

router.post(
  "/classes/:classId/materials",
  authenticate,
  requireRole("lecturer"),
  uploadMaterialFile,
  controller.handleUploadMaterial,
);

/**
 * @openapi
 * /materials/{materialId}:
 *   delete:
 *     tags: [Materials]
 *     summary: Delete a material (owner lecturer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Material deleted
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         description: Not this class's lecturer
 *       404:
 *         description: Material not found
 */
router.delete(
  "/materials/:materialId",
  authenticate,
  requireRole("lecturer"),
  controller.handleDeleteMaterial,
);

module.exports = router;
