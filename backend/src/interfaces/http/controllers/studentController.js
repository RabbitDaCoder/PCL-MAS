// Composition root for student-only routes: wires concrete infrastructure into use-cases.
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const tokenService = require("../../../infrastructure/security/tokenService");
const updateStudentProfile = require("../../../application/student/updateStudentProfile");
const { success } = require("../../../utils/apiResponse");

const userRepository = new MongoUserRepository();
const deps = { userRepository, tokenService };

async function handleUpdateProfile(req, res, next) {
  try {
    const { firstName, lastName } = req.body ?? {};
    const result = await updateStudentProfile(deps, {
      studentId: req.user.id,
      firstName,
      lastName,
    });
    res.json(success(result, "Profile updated"));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deps,
  handleUpdateProfile,
};
