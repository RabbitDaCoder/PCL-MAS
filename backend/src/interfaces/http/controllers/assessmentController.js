// Composition root for assessments: wires concrete infrastructure into the application use-cases.
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const MongoClassRepository = require("../../../infrastructure/repositories/MongoClassRepository");
const MongoMaterialRepository = require("../../../infrastructure/repositories/MongoMaterialRepository");
const MongoAssessmentRepository = require("../../../infrastructure/repositories/MongoAssessmentRepository");
const MongoMessageRepository = require("../../../infrastructure/repositories/MongoMessageRepository");
const tokenService = require("../../../infrastructure/security/tokenService");
const generateAssessment = require("../../../application/assessments/generateAssessment");
const getAssessment = require("../../../application/assessments/getAssessment");
const reviewAssessment = require("../../../application/assessments/reviewAssessment");
const submitAssessment = require("../../../application/assessments/submitAssessment");
const announceAssessmentRelease = require("../../../application/assessments/announceAssessmentRelease");
const { emitClassMessage } = require("../../../sockets/emitters");
const { success } = require("../../../utils/apiResponse");

const userRepository = new MongoUserRepository();
const classRepository = new MongoClassRepository();
const materialRepository = new MongoMaterialRepository();
const assessmentRepository = new MongoAssessmentRepository();
const messageRepository = new MongoMessageRepository();
const deps = {
  userRepository,
  classRepository,
  materialRepository,
  assessmentRepository,
  messageRepository,
  tokenService,
};

async function handleGenerateAssessment(req, res, next) {
  try {
    const result = await generateAssessment(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
      type: req.params.type,
    });
    res.status(201).json(success(result, "Assessment generated"));
  } catch (err) {
    next(err);
  }
}

async function handleGetAssessment(req, res, next) {
  try {
    const result = await getAssessment(deps, {
      classId: req.params.classId,
      userId: req.user.id,
      role: req.user.role,
      type: req.params.type,
    });
    res.json(success(result, "Assessment retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleSubmitAssessment(req, res, next) {
  try {
    const result = await submitAssessment(deps, {
      classId: req.params.classId,
      userId: req.user.id,
      role: req.user.role,
      type: req.params.type,
      answers: req.body?.answers,
    });
    res.json(success(result, "Assessment submitted"));
  } catch (err) {
    next(err);
  }
}

async function handleReviewAssessment(req, res, next) {
  try {
    const result = await reviewAssessment(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
      type: req.params.type,
      decision: req.body?.decision,
      questions: req.body?.questions,
    });
    res.json(success(result, "Assessment review updated"));
    if (result.justApproved) {
      announceAssessmentRelease(
        deps,
        { classId: req.params.classId, type: req.params.type },
        { emitClassMessage },
      );
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deps,
  handleGenerateAssessment,
  handleGetAssessment,
  handleReviewAssessment,
  handleSubmitAssessment,
};
