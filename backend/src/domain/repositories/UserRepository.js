// Repository contract the application layer depends on; infrastructure provides the real implementation.
class UserRepository {
  async findByEmail(_email) {
    throw new Error("Not implemented");
  }

  async findById(_id) {
    throw new Error("Not implemented");
  }

  async create(_userData) {
    throw new Error("Not implemented");
  }

  async setResetToken(_userId, _tokenHash, _expiresAt) {
    throw new Error("Not implemented");
  }

  async findByResetTokenHash(_tokenHash) {
    throw new Error("Not implemented");
  }

  async resetPassword(_userId, _passwordHash) {
    throw new Error("Not implemented");
  }

  async countAll() {
    throw new Error("Not implemented");
  }

  async countByRole(_role) {
    throw new Error("Not implemented");
  }

  async findRecent(_limit) {
    throw new Error("Not implemented");
  }

  async updateProfile(_userId, _updates) {
    throw new Error("Not implemented");
  }

  async recordLogin(_userId) {
    throw new Error("Not implemented");
  }
}

module.exports = UserRepository;
