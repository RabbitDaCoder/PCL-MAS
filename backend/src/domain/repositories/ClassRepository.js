// Repository contract for the Class aggregate (a class plus who's enrolled in it).
class ClassRepository {
  async findByLecturer(_lecturerId) {
    throw new Error("Not implemented");
  }

  async findEnrollmentsByStudent(_studentId) {
    throw new Error("Not implemented");
  }

  async countAll() {
    throw new Error("Not implemented");
  }

  async findAll() {
    throw new Error("Not implemented");
  }

  async create(_classData) {
    throw new Error("Not implemented");
  }

  async findById(_classId) {
    throw new Error("Not implemented");
  }

  async findMembers(_classId) {
    throw new Error("Not implemented");
  }

  async findMembershipByEmail(_classId, _email) {
    throw new Error("Not implemented");
  }

  async findMembershipByStudentId(_classId, _studentId) {
    throw new Error("Not implemented");
  }

  async addMembership(_membershipData) {
    throw new Error("Not implemented");
  }

  async removeMembership(_classId, _studentId) {
    throw new Error("Not implemented");
  }

  async incrementStudentCount(_classId, _delta) {
    throw new Error("Not implemented");
  }

  async findByClassCode(_classCode) {
    throw new Error("Not implemented");
  }

  async findActiveMembership(_classId, _studentId) {
    throw new Error("Not implemented");
  }

  async findMembershipAny(_classId, _studentId) {
    throw new Error("Not implemented");
  }

  async findInvitesByStudent(_studentId) {
    throw new Error("Not implemented");
  }

  async setMembershipStatus(_classId, _studentId, _status, _extra) {
    throw new Error("Not implemented");
  }
}

module.exports = ClassRepository;
