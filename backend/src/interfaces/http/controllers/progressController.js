// Composition root for Progress: wires concrete infrastructure into the application use-cases.
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const MongoClassRepository = require("../../../infrastructure/repositories/MongoClassRepository");
const MongoMessageRepository = require("../../../infrastructure/repositories/MongoMessageRepository");
const MongoQuestionRepository = require("../../../infrastructure/repositories/MongoQuestionRepository");
const MongoLearningProfileRepository = require("../../../infrastructure/repositories/MongoLearningProfileRepository");
const MongoAssessmentRepository = require("../../../infrastructure/repositories/MongoAssessmentRepository");
const MongoAssignmentRepository = require("../../../infrastructure/repositories/MongoAssignmentRepository");
const MongoAIInteractionRepository = require("../../../infrastructure/repositories/MongoAIInteractionRepository");
const tokenService = require("../../../infrastructure/security/tokenService");
const getClassProgress = require("../../../application/progress/getClassProgress");
const getMyProgress = require("../../../application/progress/getMyProgress");
const getStudentDetail = require("../../../application/progress/getStudentDetail");
const AppError = require("../../../domain/errors/AppError");
const { success } = require("../../../utils/apiResponse");

const userRepository = new MongoUserRepository();
const classRepository = new MongoClassRepository();
const messageRepository = new MongoMessageRepository();
const questionRepository = new MongoQuestionRepository();
const learningProfileRepository = new MongoLearningProfileRepository();
const assessmentRepository = new MongoAssessmentRepository();
const assignmentRepository = new MongoAssignmentRepository();
const aiInteractionRepository = new MongoAIInteractionRepository();
const deps = {
  userRepository,
  classRepository,
  messageRepository,
  questionRepository,
  learningProfileRepository,
  assessmentRepository,
  assignmentRepository,
  aiInteractionRepository,
  tokenService,
};

async function handleGetClassProgress(req, res, next) {
  try {
    const result = await getClassProgress(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
    });
    res.json(success(result, "Progress retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleGetMyProgress(req, res, next) {
  try {
    const result = await getMyProgress(deps, {
      classId: req.params.classId,
      studentId: req.user.id,
    });
    if (!result) {
      throw new AppError("You don't have access to this class.", 403);
    }
    res.json(success(result, "Progress retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleGetStudentDetail(req, res, next) {
  try {
    const result = await getStudentDetail(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
      studentId: req.params.studentId,
    });
    res.json(success(result, "Student detail retrieved"));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deps,
  handleGetClassProgress,
  handleGetMyProgress,
  handleGetStudentDetail,
};
