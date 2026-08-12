// Repository contract for per-student assignment instances (lecturer-authored tasks).
class AssignmentRepository {
  async createMany(_assignments) {
    throw new Error("Not implemented");
  }

  async findByClass(_classId) {
    throw new Error("Not implemented");
  }

  async findByClassAndStudent(_classId, _studentId) {
    throw new Error("Not implemented");
  }

  async findById(_assignmentId) {
    throw new Error("Not implemented");
  }

  async save(_assignment) {
    throw new Error("Not implemented");
  }
}

module.exports = AssignmentRepository;
