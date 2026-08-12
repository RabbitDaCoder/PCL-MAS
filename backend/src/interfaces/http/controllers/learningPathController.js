// Composition root for the learning path: wires concrete infrastructure into the use-cases.
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const MongoClassRepository = require("../../../infrastructure/repositories/MongoClassRepository");
const MongoAssessmentRepository = require("../../../infrastructure/repositories/MongoAssessmentRepository");
const MongoLearningProfileRepository = require("../../../infrastructure/repositories/MongoLearningProfileRepository");
const tokenService = require("../../../infrastructure/security/tokenService");
const generateLearningPath = require("../../../application/learningPath/generateLearningPath");
const getLearningPath = require("../../../application/learningPath/getLearningPath");
const reviewLearningPath = require("../../../application/learningPath/reviewLearningPath");
const { success } = require("../../../utils/apiResponse");

const userRepository = new MongoUserRepository();
const classRepository = new MongoClassRepository();
const assessmentRepository = new MongoAssessmentRepository();
const learningProfileRepository = new MongoLearningProfileRepository();
const deps = {
  userRepository,
  classRepository,
  assessmentRepository,
  learningProfileRepository,
  tokenService,
};

async function handleGenerateLearningPath(req, res, next) {
  try {
    const result = await generateLearningPath(deps, {
      classId: req.params.classId,
      studentId: req.user.id,
    });
    res.status(201).json(success(result, "Learning path generated"));
  } catch (err) {
    next(err);
  }
}

async function handleGetLearningPath(req, res, next) {
  try {
    const result = await getLearningPath(deps, {
      classId: req.params.classId,
      userId: req.user.id,
      role: req.user.role,
      studentId: req.query.studentId,
    });
    res.json(success(result, "Learning path retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleReviewLearningPath(req, res, next) {
  try {
    const result = await reviewLearningPath(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
      studentId: req.body.studentId,
      decision: req.body.decision,
    });
    res.json(success(result, "Learning path reviewed"));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deps,
  handleGenerateLearningPath,
  handleGetLearningPath,
  handleReviewLearningPath,
};
