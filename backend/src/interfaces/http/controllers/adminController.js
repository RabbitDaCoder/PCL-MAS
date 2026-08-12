// Composition root for admin: wires concrete infrastructure into the application use-cases.
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const MongoClassRepository = require("../../../infrastructure/repositories/MongoClassRepository");
const tokenService = require("../../../infrastructure/security/tokenService");
const getStats = require("../../../application/admin/getStats");
const getRecentUsers = require("../../../application/admin/getRecentUsers");
const getAiServiceStatus = require("../../../application/admin/getAiServiceStatus");
const getUsersList = require("../../../application/admin/getUsersList");
const getClassesOverview = require("../../../application/admin/getClassesOverview");
const getSystemInfo = require("../../../application/admin/getSystemInfo");
const { success } = require("../../../utils/apiResponse");

const userRepository = new MongoUserRepository();
const classRepository = new MongoClassRepository();
const deps = { userRepository, classRepository, tokenService };

async function handleGetStats(req, res, next) {
  try {
    const result = await getStats(deps);
    res.json(success(result, "Stats retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleGetRecentUsers(req, res, next) {
  try {
    const result = await getRecentUsers(deps, { limit: 5 });
    res.json(success(result, "Recent users retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleGetAiStatus(req, res, next) {
  try {
    const result = await getAiServiceStatus();
    res.json(success(result, "AI service status retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleGetUsersList(req, res, next) {
  try {
    const result = await getUsersList(deps, req.query);
    res.json(success(result, "Users retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleGetClassesOverview(req, res, next) {
  try {
    const result = await getClassesOverview(deps);
    res.json(success(result, "Classes retrieved"));
  } catch (err) {
    next(err);
  }
}

async function handleGetSystemInfo(req, res, next) {
  try {
    const result = await getSystemInfo();
    res.json(success(result, "System info retrieved"));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deps,
  handleGetStats,
  handleGetRecentUsers,
  handleGetAiStatus,
  handleGetUsersList,
  handleGetClassesOverview,
  handleGetSystemInfo,
};
