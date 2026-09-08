// Mongoose-backed implementation of the domain AgentTaskRepository contract.
const AgentTaskRepository = require("../../domain/repositories/AgentTaskRepository");
const AgentTaskModel = require("../database/models/AgentTask");

class MongoAgentTaskRepository extends AgentTaskRepository {
  async create(data) {
    return AgentTaskModel.create(data);
  }
}

module.exports = MongoAgentTaskRepository;
