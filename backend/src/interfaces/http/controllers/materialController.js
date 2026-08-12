// Composition root for materials: wires concrete infrastructure into the application use-cases.
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const MongoClassRepository = require("../../../infrastructure/repositories/MongoClassRepository");
const MongoMaterialRepository = require("../../../infrastructure/repositories/MongoMaterialRepository");
const MongoAssessmentRepository = require("../../../infrastructure/repositories/MongoAssessmentRepository");
const tokenService = require("../../../infrastructure/security/tokenService");
const uploadMaterial = require("../../../application/materials/uploadMaterial");
const getClassMaterials = require("../../../application/materials/getClassMaterials");
const deleteMaterial = require("../../../application/materials/deleteMaterial");
const { success } = require("../../../utils/apiResponse");

const userRepository = new MongoUserRepository();
const classRepository = new MongoClassRepository();
const materialRepository = new MongoMaterialRepository();
const assessmentRepository = new MongoAssessmentRepository();
const deps = {
  userRepository,
  classRepository,
  materialRepository,
  assessmentRepository,
  tokenService,
};

async function handleUploadMaterial(req, res, next) {
  try {
    const { title, description } = req.body ?? {};
    const result = await uploadMaterial(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
      title,
      description,
      file: req.file,
    });
    res.status(201).json(success(result, "Material uploaded"));
  } catch (err) {
    next(err);
  }
}

async function handleGetClassMaterials(req, res, next) {
  try {
    const result = await getClassMaterials(deps, {
      classId: req.params.classId,
      userId: req.user.id,
      role: req.user.role,
    });
    res.json(success(result, "Materials retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleDeleteMaterial(req, res, next) {
  try {
    const result = await deleteMaterial(deps, {
      materialId: req.params.materialId,
      lecturerId: req.user.id,
    });
    res.json(success(result, "Material deleted"));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deps,
  handleUploadMaterial,
  handleGetClassMaterials,
  handleDeleteMaterial,
};
