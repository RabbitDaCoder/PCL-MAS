// Composition root for improvement insights: wires concrete infrastructure into the use-cases.
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const MongoClassRepository = require("../../../infrastructure/repositories/MongoClassRepository");
const MongoMaterialRepository = require("../../../infrastructure/repositories/MongoMaterialRepository");
const MongoAssessmentRepository = require("../../../infrastructure/repositories/MongoAssessmentRepository");
const MongoLearningProfileRepository = require("../../../infrastructure/repositories/MongoLearningProfileRepository");
const MongoMessageRepository = require("../../../infrastructure/repositories/MongoMessageRepository");
const MongoDirectMessageRepository = require("../../../infrastructure/repositories/MongoDirectMessageRepository");
const MongoAIInteractionRepository = require("../../../infrastructure/repositories/MongoAIInteractionRepository");
const MongoApprovalRepository = require("../../../infrastructure/repositories/MongoApprovalRepository");
const MongoAgentTaskRepository = require("../../../infrastructure/repositories/MongoAgentTaskRepository");
const tokenService = require("../../../infrastructure/security/tokenService");
const generateInsights = require("../../../application/insights/generateInsights");
const getInsights = require("../../../application/insights/getInsights");
const dismissInsight = require("../../../application/insights/dismissInsight");
const previewInsight = require("../../../application/insights/previewInsight");
const applyInsight = require("../../../application/insights/applyInsight");
const { success } = require("../../../utils/apiResponse");

const deps = {
  userRepository: new MongoUserRepository(),
  classRepository: new MongoClassRepository(),
  materialRepository: new MongoMaterialRepository(),
  assessmentRepository: new MongoAssessmentRepository(),
  learningProfileRepository: new MongoLearningProfileRepository(),
  messageRepository: new MongoMessageRepository(),
  directMessageRepository: new MongoDirectMessageRepository(),
  aiInteractionRepository: new MongoAIInteractionRepository(),
  approvalRepository: new MongoApprovalRepository(),
  agentTaskRepository: new MongoAgentTaskRepository(),
  tokenService,
};

async function handleGenerateInsights(req, res, next) {
  try {
    const result = await generateInsights(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
    });
    res.status(201).json(success(result, "Insight generation complete"));
  } catch (err) {
    next(err);
  }
}

async function handleGetInsights(req, res, next) {
  try {
    const result = await getInsights(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
      status: req.query.status,
    });
    res.json(success(result, "Insights retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleDismissInsight(req, res, next) {
  try {
    const result = await dismissInsight(deps, {
      classId: req.params.classId,
      insightId: req.params.insightId,
      lecturerId: req.user.id,
      reason: req.body?.reason,
    });
    res.json(success(result, "Insight dismissed"));
  } catch (err) {
    next(err);
  }
}

async function handlePreviewInsight(req, res, next) {
  try {
    const result = await previewInsight(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
      candidateInstructions: req.body?.candidateInstructions,
      samplePrompt: req.body?.samplePrompt,
    });
    res.json(success(result, "Preview generated"));
  } catch (err) {
    next(err);
  }
}

async function handleApplyInsight(req, res, next) {
  try {
    const result = await applyInsight(deps, {
      classId: req.params.classId,
      insightId: req.params.insightId,
      lecturerId: req.user.id,
      finalInstructionText: req.body?.finalInstructionText,
    });
    res.json(success(result, "Insight applied"));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deps,
  handleGenerateInsights,
  handleGetInsights,
  handleDismissInsight,
  handlePreviewInsight,
  handleApplyInsight,
};
