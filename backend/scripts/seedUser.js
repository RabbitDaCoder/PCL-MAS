// One-off script to create a test account for any role (admin has no public registration route,
// but this is also handy for seeding known-password student/lecturer accounts).
// Usage: node scripts/seedAdmin.js <role> <email> <password> [firstName] [lastName]
require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("../src/infrastructure/database/models/User");
const passwordHasher = require("../src/infrastructure/security/passwordHasher");
const { ROLES } = require("../src/domain/entities/User");

async function main() {
  const [role, email, password, firstName = "Test", lastName = "User"] =
    process.argv.slice(2);

  if (!role || !Object.values(ROLES).includes(role) || !email || !password) {
    console.error(
      `Usage: node scripts/seedAdmin.js <${Object.values(ROLES).join("|")}> <email> <password> [firstName] [lastName]`,
    );
    process.exitCode = 1;
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`An account with ${email} already exists (role: ${existing.role}).`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await passwordHasher.hash(password);
  await UserModel.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password: passwordHash,
    role,
  });

  console.log(`${role} account created: ${email}`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
