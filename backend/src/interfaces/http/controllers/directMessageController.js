// Composition root for the 1:1 Administrative AI direct-message channel — separate surface from
// class-group chat (see classController.js's message handlers).
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const MongoClassRepository = require("../../../infrastructure/repositories/MongoClassRepository");
const MongoAssessmentRepository = require("../../../infrastructure/repositories/MongoAssessmentRepository");
const MongoDirectMessageRepository = require("../../../infrastructure/repositories/MongoDirectMessageRepository");
const tokenService = require("../../../infrastructure/security/tokenService");
const getDmThread = require("../../../application/directMessages/getDmThread");
const sendDmMessage = require("../../../application/directMessages/sendDmMessage");
const triggerAdminAiDmReply = require("../../../application/directMessages/triggerAdminAiDmReply");
const {
  emitDmMessage,
  emitNotification,
} = require("../../../sockets/emitters");
const { success } = require("../../../utils/apiResponse");

const userRepository = new MongoUserRepository();
const classRepository = new MongoClassRepository();
const assessmentRepository = new MongoAssessmentRepository();
const directMessageRepository = new MongoDirectMessageRepository();
const deps = {
  userRepository,
  classRepository,
  assessmentRepository,
  directMessageRepository,
  tokenService,
};

async function handleGetDmThread(req, res, next) {
  try {
    const result = await getDmThread(deps, {
      classId: req.params.classId,
      studentId: req.user.id,
    });
    res.json(success(result, "Thread retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleSendDmMessage(req, res, next) {
  try {
    const { content } = req.body ?? {};
    const result = await sendDmMessage(deps, {
      classId: req.params.classId,
      studentId: req.user.id,
      content,
    });
    res.status(201).json(success(result, "Message sent"));
    triggerAdminAiDmReply(
      deps,
      { classId: req.params.classId, studentId: req.user.id, content },
      { emitDmMessage, emitNotification },
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deps,
  handleGetDmThread,
  handleSendDmMessage,
};
