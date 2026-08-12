// Composition root for the AI-service passthrough endpoint.
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const tokenService = require("../../../infrastructure/security/tokenService");
const getAiStatus = require("../../../application/ai/getAiStatus");
const { success } = require("../../../utils/apiResponse");

const deps = { userRepository: new MongoUserRepository(), tokenService };

async function handleGetStatus(req, res, next) {
  try {
    const result = await getAiStatus();
    res.json(success(result, "AI service status retrieved"));
  } catch (err) {
    next(err);
  }
}

module.exports = { deps, handleGetStatus };
