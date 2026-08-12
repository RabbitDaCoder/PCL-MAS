// Composition root for assignments/tasks: wires concrete infrastructure into use-cases.
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const MongoClassRepository = require("../../../infrastructure/repositories/MongoClassRepository");
const MongoAssignmentRepository = require("../../../infrastructure/repositories/MongoAssignmentRepository");
const MongoAssessmentRepository = require("../../../infrastructure/repositories/MongoAssessmentRepository");
const tokenService = require("../../../infrastructure/security/tokenService");
const createAssignment = require("../../../application/assignments/createAssignment");
const getClassAssignments = require("../../../application/assignments/getClassAssignments");
const getStudentAssignments = require("../../../application/assignments/getStudentAssignments");
const submitAssignment = require("../../../application/assignments/submitAssignment");
const gradeAssignment = require("../../../application/assignments/gradeAssignment");
const { success } = require("../../../utils/apiResponse");

const userRepository = new MongoUserRepository();
const classRepository = new MongoClassRepository();
const assignmentRepository = new MongoAssignmentRepository();
const assessmentRepository = new MongoAssessmentRepository();
const deps = {
  userRepository,
  classRepository,
  assignmentRepository,
  assessmentRepository,
  tokenService,
};

async function handleCreateAssignment(req, res, next) {
  try {
    const result = await createAssignment(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
      title: req.body?.title,
      description: req.body?.description,
      instructions: req.body?.instructions,
      resources: req.body?.resources,
      dueDate: req.body?.dueDate,
    });
    res.status(201).json(success(result, "Assignment created"));
  } catch (err) {
    next(err);
  }
}

async function handleGetClassAssignments(req, res, next) {
  try {
    const result = await getClassAssignments(deps, {
      classId: req.params.classId,
      lecturerId: req.user.id,
    });
    res.json(success(result, "Assignments retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleGetStudentAssignments(req, res, next) {
  try {
    const result = await getStudentAssignments(deps, {
      classId: req.params.classId,
      studentId: req.user.id,
    });
    res.json(success(result, "Assignments retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleSubmitAssignment(req, res, next) {
  try {
    const result = await submitAssignment(deps, {
      assignmentId: req.params.assignmentId,
      studentId: req.user.id,
      text: req.body?.text,
      file: req.file,
    });
    res.json(success(result, "Assignment submitted"));
  } catch (err) {
    next(err);
  }
}

async function handleGradeAssignment(req, res, next) {
  try {
    const score =
      req.body?.score === undefined ? undefined : Number(req.body.score);
    const result = await gradeAssignment(deps, {
      assignmentId: req.params.assignmentId,
      lecturerId: req.user.id,
      score,
      feedback: req.body?.feedback,
    });
    res.json(success(result, "Assignment graded"));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deps,
  handleCreateAssignment,
  handleGetClassAssignments,
  handleGetStudentAssignments,
  handleSubmitAssignment,
  handleGradeAssignment,
};
