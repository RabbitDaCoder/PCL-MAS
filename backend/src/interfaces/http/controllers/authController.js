// Composition root for auth: wires concrete infrastructure into the application use-cases.
const MongoUserRepository = require("../../../infrastructure/repositories/MongoUserRepository");
const passwordHasher = require("../../../infrastructure/security/passwordHasher");
const tokenService = require("../../../infrastructure/security/tokenService");
const register = require("../../../application/auth/register");
const login = require("../../../application/auth/login");
const forgotPassword = require("../../../application/auth/forgotPassword");
const resetPassword = require("../../../application/auth/resetPassword");
const logout = require("../../../application/auth/logout");
const { success } = require("../../../utils/apiResponse");
const { notifyUserRegistered } = require("../../../sockets/emitters");

const userRepository = new MongoUserRepository();
const deps = { userRepository, passwordHasher, tokenService };

async function handleRegister(req, res, next) {
  try {
    const result = await register(deps, req.body ?? {});
    res.status(201).json(success(result, "Registration successful"));
    // Fire-and-forget: a live-dashboard push failing should never fail the registration itself.
    notifyUserRegistered(result.user).catch(() => {});
  } catch (err) {
    next(err);
  }
}

async function handleLogin(req, res, next) {
  try {
    const result = await login(deps, req.body ?? {});
    res.json(success(result, "Login successful"));
  } catch (err) {
    next(err);
  }
}

function handleMe(req, res) {
  res.json(success(req.user, "Current user retrieved"));
}

async function handleForgotPassword(req, res, next) {
  try {
    const result = await forgotPassword(deps, req.body ?? {});
    res.json(success(null, result.message));
  } catch (err) {
    next(err);
  }
}

async function handleResetPassword(req, res, next) {
  try {
    const result = await resetPassword(deps, {
      token: req.params.token,
      password: req.body?.password,
    });
    res.json(success(null, result.message));
  } catch (err) {
    next(err);
  }
}

async function handleLogout(req, res, next) {
  try {
    const result = await logout();
    res.json(success(null, result.message));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deps,
  handleRegister,
  handleLogin,
  handleMe,
  handleForgotPassword,
  handleResetPassword,
  handleLogout,
};
