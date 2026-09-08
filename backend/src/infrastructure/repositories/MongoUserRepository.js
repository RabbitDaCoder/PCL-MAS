// Mongoose-backed implementation of the domain UserRepository contract.
const UserRepository = require("../../domain/repositories/UserRepository");
const UserModel = require("../database/models/User");

class MongoUserRepository extends UserRepository {
  async findByEmail(email) {
    return UserModel.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
  }

  async findById(id) {
    return UserModel.findById(id);
  }

  async create(userData) {
    return UserModel.create(userData);
  }

  async setResetToken(userId, tokenHash, expiresAt) {
    await UserModel.findByIdAndUpdate(userId, {
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: expiresAt,
    });
  }

  async findByResetTokenHash(tokenHash) {
    return UserModel.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpires");
  }

  async resetPassword(userId, passwordHash) {
    await UserModel.findByIdAndUpdate(userId, {
      password: passwordHash,
      $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 },
    });
  }

  async countAll() {
    return UserModel.countDocuments();
  }

  async countByRole(role) {
    return UserModel.countDocuments({ role });
  }

  async findRecent(limit) {
    return UserModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("firstName lastName role createdAt");
  }

  async findPaginated({ page, limit, search, role }) {
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const regex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("firstName lastName email role createdAt isActive"),
      UserModel.countDocuments(filter),
    ]);
    return { users, total };
  }

  async updateProfile(userId, updates) {
    return UserModel.findByIdAndUpdate(userId, updates, { new: true });
  }

  // Login-frequency analytics — a real, timestamped signal for the learning-analytics audit.
  async recordLogin(userId) {
    await UserModel.findByIdAndUpdate(userId, {
      $set: { lastLoginAt: new Date() },
      $inc: { loginCount: 1 },
    });
  }
}

module.exports = MongoUserRepository;
