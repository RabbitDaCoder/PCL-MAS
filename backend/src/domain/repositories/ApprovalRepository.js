// Repository contract for the human-review queue (AI-generated content/insights awaiting a
// lecturer's approve/reject/edit decision). Not yet wired to any use-case — built now so a later
// phase can use it without a repository-layer detour.
class ApprovalRepository {
  async create(_data) {
    throw new Error("Not implemented");
  }

  async findById(_approvalId) {
    throw new Error("Not implemented");
  }

  async findByClass(_classId, _status) {
    throw new Error("Not implemented");
  }

  async findByStudent(_studentId, _status) {
    throw new Error("Not implemented");
  }

  async updateStatus(_approvalId, _fields) {
    throw new Error("Not implemented");
  }
}

module.exports = ApprovalRepository;
