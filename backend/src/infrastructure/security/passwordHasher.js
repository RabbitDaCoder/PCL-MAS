// Password hashing wrapper around bcrypt — the only place bcrypt is imported directly.
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

async function hash(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function compare(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

module.exports = { hash, compare };
