// Repository contract for logged agent/config-change tasks — used as the audit trail when a
// human-approved insight is applied to a class's AI instructions.
class AgentTaskRepository {
  async create(_data) {
    throw new Error("Not implemented");
  }
}

module.exports = AgentTaskRepository;
