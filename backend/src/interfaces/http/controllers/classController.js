// Composition root for classes: wires concrete infrastructure into the application use-cases.
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const MongoClassRepository = require("../../../infrastructure/repositories/MongoClassRepository");
const MongoMessageRepository = require("../../../infrastructure/repositories/MongoMessageRepository");
const MongoAssessmentRepository = require("../../../infrastructure/repositories/MongoAssessmentRepository");
const MongoMaterialRepository = require("../../../infrastructure/repositories/MongoMaterialRepository");
const tokenService = require("../../../infrastructure/security/tokenService");
const getMyClasses = require("../../../application/classes/getMyClasses");
const createClass = require("../../../application/classes/createClass");
const generateClassCode = require("../../../application/classes/generateClassCode");
const getClassDetail = require("../../../application/classes/getClassDetail");
const getClassStudents = require("../../../application/classes/getClassStudents");
const inviteStudent = require("../../../application/classes/inviteStudent");
const removeStudent = require("../../../application/classes/removeStudent");
const getClassMessages = require("../../../application/classes/getClassMessages");
const sendClassMessage = require("../../../application/classes/sendClassMessage");
const clearClassMessages = require("../../../application/classes/clearClassMessages");
const triggerAdminAiReply = require("../../../application/classes/triggerAdminAiReply");
const getClassInvites = require("../../../application/classes/getClassInvites");
const acceptClassInvite = require("../../../application/classes/acceptClassInvite");
const joinClassByCode = require("../../../application/classes/joinClassByCode");
const sendOnboardingDm = require("../../../application/directMessages/sendOnboardingDm");
const MongoDirectMessageRepository = require("../../../infrastructure/repositories/MongoDirectMessageRepository");
const {
  emitClassMessage,
  emitClassMembershipUpdate,
  emitDmMessage,
  emitNotification,
} = require("../../../sockets/emitters");
const { success } = require("../../../utils/apiResponse");

const userRepository = new MongoUserRepository();
const classRepository = new MongoClassRepository();
const messageRepository = new MongoMessageRepository();
const assessmentRepository = new MongoAssessmentRepository();
const directMessageRepository = new MongoDirectMessageRepository();
const materialRepository = new MongoMaterialRepository();
const deps = {
  userRepository,
  classRepository,
  messageRepository,
  assessmentRepository,
  directMessageRepository,
  materialRepository,
  tokenService,
};

async function handleGetMyClasses(req, res, next) {
  try {
    const result = await getMyClasses(deps, {
      userId: req.user.id,
      role: req.user.role,
    });
    res.json(success(result, "Classes retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleCreateClass(req, res, next) {
  try {
    const {
      name,
      courseCode,
      department,
      level,
      semester,
      academicSession,
      description,
      learningObjectives,
      topics,
      aiInstructions,
      startDate,
      endDate,
      enrollmentMode,
      classCode,
      maxStudents,
    } = req.body ?? {};
    const result = await createClass(deps, {
      lecturerId: req.user.id,
      name,
      courseCode,
      department,
      level,
      semester,
      academicSession,
      description,
      learningObjectives,
      topics,
      aiInstructions,
      startDate,
      endDate,
      enrollmentMode,
      classCode,
      maxStudents,
    });
    res.status(201).json(success(result, "Class created"));
  } catch (err) {
    next(err);
  }
}

async function handleGenerateClassCode(req, res, next) {
  try {
    const result = await generateClassCode(deps);
    res.json(success(result, "Class code generated"));
  } catch (err) {
    next(err);
  }
}

async function handleGetClassDetail(req, res, next) {
  try {
    const result = await getClassDetail(deps, {
      classId: req.params.classId,
      userId: req.user.id,
      role: req.user.role,
    });
    res.json(success(result, "Class retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleGetClassStudents(req, res, next) {
  try {
    const result = await getClassStudents(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
    });
    res.json(success(result, "Students retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleInviteStudent(req, res, next) {
  try {
    const { email } = req.body ?? {};
    const result = await inviteStudent(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
      email,
    });
    res.status(201).json(success(result, "Invite sent"));
  } catch (err) {
    next(err);
  }
}

async function handleRemoveStudent(req, res, next) {
  try {
    await removeStudent(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
      studentId: req.params.userId,
    });
    emitClassMembershipUpdate(req.params.classId, req.params.userId, {
      classId: req.params.classId,
      status: "removed",
    });
    res.json(success(null, "Student removed"));
  } catch (err) {
    next(err);
  }
}

async function handleGetClassMessages(req, res, next) {
  try {
    const result = await getClassMessages(deps, {
      classId: req.params.classId,
      userId: req.user.id,
      role: req.user.role,
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(success(result, "Messages retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleSendClassMessage(req, res, next) {
  try {
    const { content } = req.body ?? {};
    const result = await sendClassMessage(deps, {
      classId: req.params.classId,
      userId: req.user.id,
      role: req.user.role,
      senderRole: req.user.role,
      content,
    });
    emitClassMessage(req.params.classId, result);
    res.status(201).json(success(result, "Message sent"));
    if (req.user.role === "student") {
      triggerAdminAiReply(
        deps,
        { classId: req.params.classId, studentId: req.user.id, content },
        { emitClassMessage },
      );
    }
  } catch (err) {
    next(err);
  }
}

async function handleClearClassMessages(req, res, next) {
  try {
    const result = await clearClassMessages(deps, {
      classId: req.params.classId,
      userId: req.user.id,
      role: req.user.role,
    });
    res.json(success(result, "Class chat cleared"));
  } catch (err) {
    next(err);
  }
}

async function handleGetClassInvites(req, res, next) {
  try {
    const result = await getClassInvites(deps, { studentId: req.user.id });
    res.json(success(result, "Invites retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleAcceptClassInvite(req, res, next) {
  try {
    const result = await acceptClassInvite(deps, {
      classId: req.params.classId,
      studentId: req.user.id,
    });
    emitClassMembershipUpdate(req.params.classId, req.user.id, {
      classId: req.params.classId,
      status: "active",
    });
    res.json(success(result, "Invite accepted"));
    sendOnboardingDm(
      deps,
      { classId: req.params.classId, studentId: req.user.id },
      { emitDmMessage, emitNotification },
    );
  } catch (err) {
    next(err);
  }
}

async function handleJoinClass(req, res, next) {
  try {
    const { classCode } = req.body ?? {};
    const result = await joinClassByCode(deps, {
      classCode,
      studentId: req.user.id,
    });
    emitClassMembershipUpdate(result.classId, req.user.id, {
      classId: result.classId,
      status: "active",
    });
    res.status(201).json(success(result, "Joined class"));
    sendOnboardingDm(
      deps,
      { classId: result.classId, studentId: req.user.id },
      { emitDmMessage, emitNotification },
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deps,
  handleGetMyClasses,
  handleCreateClass,
  handleGenerateClassCode,
  handleGetClassDetail,
  handleGetClassStudents,
  handleInviteStudent,
  handleRemoveStudent,
  handleGetClassMessages,
  handleSendClassMessage,
  handleClearClassMessages,
  handleGetClassInvites,
  handleAcceptClassInvite,
  handleJoinClass,
};
