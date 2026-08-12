// Composition root for questions: wires concrete infrastructure into the application use-cases.
const MongoClassRepository = require("../../../infrastructure/repositories/MongoClassRepository");
const MongoQuestionRepository = require("../../../infrastructure/repositories/MongoQuestionRepository");
const MongoAssessmentRepository = require("../../../infrastructure/repositories/MongoAssessmentRepository");
const tokenService = require("../../../infrastructure/security/tokenService");
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const getQuestions = require("../../../application/questions/getQuestions");
const respondToQuestion = require("../../../application/questions/respondToQuestion");
const seedTestQuestion = require("../../../application/questions/seedTestQuestion");
const submitQuestion = require("../../../application/questions/submitQuestion");
const getMyQuestions = require("../../../application/questions/getMyQuestions");
const { emitQuestionAnswered } = require("../../../sockets/emitters");
const { success } = require("../../../utils/apiResponse");
const env = require("../../../config/env");
const AppError = require("../../../domain/errors/AppError");

const userRepository = new MongoUserRepository();
const classRepository = new MongoClassRepository();
const questionRepository = new MongoQuestionRepository();
const assessmentRepository = new MongoAssessmentRepository();
const deps = {
  userRepository,
  classRepository,
  questionRepository,
  assessmentRepository,
  tokenService,
};

async function handleGetQuestions(req, res, next) {
  try {
    const result = await getQuestions(deps, {
      lecturerId: req.user.id,
      status: req.query.status,
    });
    res.json(success(result, "Questions retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleRespondToQuestion(req, res, next) {
  try {
    const { status, lecturerResponse } = req.body ?? {};
    const result = await respondToQuestion(deps, {
      questionId: req.params.questionId,
      lecturerId: req.user.id,
      status,
      lecturerResponse,
    });
    emitQuestionAnswered(result.studentId, result);
    res.json(success(result, "Question updated"));
  } catch (err) {
    next(err);
  }
}

async function handleSubmitQuestion(req, res, next) {
  try {
    const { classId, questionText } = req.body ?? {};
    const result = await submitQuestion(deps, {
      classId,
      studentId: req.user.id,
      questionText,
    });
    res.status(201).json(success(result, "Question submitted"));
  } catch (err) {
    next(err);
  }
}

async function handleGetMyQuestions(req, res, next) {
  try {
    const result = await getMyQuestions(deps, { studentId: req.user.id });
    res.json(success(result, "Your questions retrieved"));
  } catch (err) {
    next(err);
  }
}

// DEV-ONLY: seeds a test question so Question Review can be exercised without needing the real
// student-facing Ask a Question UI (now available at POST /questions, kept for quick manual
// testing of the review flow). Disabled outside development.
async function handleSeedTestQuestion(req, res, next) {
  try {
    if (env.nodeEnv !== "development") {
      throw new AppError("Not available in this environment.", 404);
    }
    const result = await seedTestQuestion(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
    });
    res.status(201).json(success(result, "Test question seeded"));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deps,
  handleGetQuestions,
  handleRespondToQuestion,
  handleSeedTestQuestion,
  handleSubmitQuestion,
  handleGetMyQuestions,
};
