// Composition root for lecturer-dashboard routes: wires concrete infrastructure into use-cases.
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const MongoClassRepository = require("../../../infrastructure/repositories/MongoClassRepository");
const tokenService = require("../../../infrastructure/security/tokenService");
const getLecturerDashboardStats = require("../../../application/lecturer/getLecturerDashboardStats");
const getLecturerPendingActions = require("../../../application/lecturer/getLecturerPendingActions");
const getLecturerActivity = require("../../../application/lecturer/getLecturerActivity");
const updateLecturerProfile = require("../../../application/lecturer/updateLecturerProfile");
const { success } = require("../../../utils/apiResponse");

const userRepository = new MongoUserRepository();
const classRepository = new MongoClassRepository();
const deps = { userRepository, classRepository, tokenService };

async function handleGetDashboardStats(req, res, next) {
  try {
    const result = await getLecturerDashboardStats(deps, {
      lecturerId: req.user.id,
    });
    res.json(success(result, "Lecturer dashboard stats retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleGetPendingActions(req, res, next) {
  try {
    const result = await getLecturerPendingActions(deps, {
      lecturerId: req.user.id,
    });
    res.json(success(result, "Pending actions retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleGetActivity(req, res, next) {
  try {
    const result = await getLecturerActivity(deps, { lecturerId: req.user.id });
    res.json(success(result, "Activity retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleUpdateProfile(req, res, next) {
  try {
    const { firstName, lastName, department, institution } = req.body ?? {};
    const result = await updateLecturerProfile(deps, {
      lecturerId: req.user.id,
      firstName,
      lastName,
      department,
      institution,
    });
    res.json(success(result, "Profile updated"));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deps,
  handleGetDashboardStats,
  handleGetPendingActions,
  handleGetActivity,
  handleUpdateProfile,
};
